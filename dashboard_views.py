from flask import jsonify, render_template, render_template_string, request, send_file
from flask_security import auth_required, current_user, roles_required, roles_accepted, SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extentions import db
from helper_functions import get_or_create, get_or_create_features
from datetime import datetime
import os
from models import influencer_features, sponsor_features, platforms, campaigns
from models import recieved_infl_req, recieved_ad_req, User
from tasks import add, export_csv, Calc_progress
from celery.result import AsyncResult
import math


def create_dashboard_views(app, user_datastore: SQLAlchemyUserDatastore, cache):
    @app.route('/get_current_user', methods=['GET'])
    @auth_required('token')
    def get_current_user():
        print(current_user)
        role = current_user.roles[0].name

        if role == 'spons':
            SpF = db.session.query(
                sponsor_features).filter_by(user_id=current_user.id).first()

            data = {'id': current_user.id,
                    "fname": current_user.fname,
                    "lname": current_user.lname,
                    "industry": SpF.industry,
                    "flag": SpF.flag,
                    "email": current_user.email,
                    "active": current_user.active,
                    "role": role,
                    'dp_name': SpF.dp_name}
            return jsonify(data)

        elif role == 'infl':
            InF = db.session.query(
                influencer_features).filter_by(user_id=current_user.id).first()
            pltnames = [p.name for p in InF.plateforms]
            data = {'id': current_user.id,
                    "fname": current_user.fname,
                    "lname": current_user.lname,
                    "plateforms": pltnames,
                    "email": current_user.email,
                    "flag": InF.flag,
                    "role": role,
                    "aboutMe": InF.aboutMe,
                    'dp_name': InF.dp_name}
            return jsonify(data)

    @app.route('/upload_image', methods=['POST'])
    @auth_required('token')
    def upload():
        # print(request.files['file'])
        if 'file' not in request.files:
            print('No file part')
            return jsonify({'message': 'no file selected'}), 400

        InF = db.session.query(
            influencer_features).filter_by(user_id=current_user.id).first()
        # print(request.form)
        file = request.files['file']
        filename = request.form['name']
        InF.dp_name = filename
        db.session.commit()
        if file:
            print(file, filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'message': 'uploaded'}), 200

    @app.route('/update_user', methods=['PUT'])
    @auth_required('token')
    def update_user():
        print(current_user)
        cache.clear()
        data = request.get_json()
        fname = data.get('fname')
        lname = data.get('lname')
        email = data.get('email')
        password = data.get('password')

        role = current_user.roles[0].name

        if role == 'spons':
            industry = data.get('industry')
            SpF = db.session.query(
                sponsor_features).filter_by(user_id=current_user.id).first()
            if industry:
                SpF.industry = industry
        elif role == 'infl':
            platforms_dic = data.get('platforms')
            aboutMe = data.get('aboutMe')
            InF = db.session.query(
                influencer_features).filter_by(user_id=current_user.id).first()
            if aboutMe:
                InF.aboutMe = aboutMe

            plt_objs = []
            if platforms_dic:
                for plt in platforms_dic:
                    plt_obj = get_or_create(db.session, platforms, name=plt)
                    plt_objs.append(plt_obj)
                if len(plt_objs) > 0:
                    InF.plateforms[:] = []
                    InF.plateforms.extend(plt_objs)

        try:
            if fname:
                current_user.fname = fname
            if lname:
                current_user.lname = lname
            if email:
                current_user.email = email
            if password:
                current_user.password = hash_password(password)
            db.session.commit()
            return jsonify({'message': 'User Updated', "user": current_user.fname, 'role': role}), 200
        except:
            print('error while updating')
            db.session.rollback()
            return jsonify({'message': 'error while updating user'}), 408

    @app.route('/add_campaign', methods=['POST'])
    @roles_required("spons")
    def add_campaign():
        print(current_user)
        data = request.get_json()
        name = data.get("name")
        description = data.get("description")
        startDate = datetime.strptime(data.get("startDate"), '%Y-%m-%d')
        endDate = datetime.strptime(data.get("endDate"), '%Y-%m-%d')
        budget = data.get("budget")
        goal = data.get("goal")
        visibility = data.get("visibility")

        camp_new = campaigns(name=name, description=description,
                             start_date=startDate, end_date=endDate,
                             budget=budget, goals=goal, visibility=visibility, s_id=current_user.id)
        db.session.add(camp_new)
        SpF = db.session.query(
            sponsor_features).filter_by(user_id=current_user.id).first()
        SpF.campaigns.append(camp_new)
        try:
            db.session.commit()
            return jsonify({"data": data, "message": 'Campaign added successfully'}), 200
        except Exception:
            db.session.rollback()
            return jsonify({"data": data, "message": 'Campaign addition failed'}), 408

    @app.route('/get_campaigns', methods=['GET'])
    @roles_required("spons")
    def get_campaigns():
        SpF = db.session.query(
            sponsor_features).filter_by(user_id=current_user.id).first()
        camps = SpF.campaigns
        if not camps:
            return jsonify({'message': 'No campaigns found'}), 404

        camp_array = []
        for camp in camps:
            camp_array.append({'name': camp.name, 'description': camp.description,
                               'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                               'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                               'flag': camp.flag, 'id': camp.id})
        return jsonify(camp_array)

    @app.route('/delete_campaigns/<id>', methods=['DELETE'])
    @roles_required("spons")
    def delete_campaigns(id):
        cache.clear()
        SpF = db.session.query(
            sponsor_features).filter_by(user_id=current_user.id).first()
        camp_del = campaigns.query.filter(
            (campaigns.id == id) & (campaigns.s_id == current_user.id)).first()

        sent_req_to_infl = recieved_ad_req.query.filter_by(
            campaign_id=id).first()
        sent_req_to_spons = recieved_infl_req.query.filter_by(
            camp_id=id).first()
        # camps = SpF.campaigns
        # if not camps:
        #     return jsonify({'message':'No campaigns found'}),404
        print(camp_del.name)
        SpF.campaigns.remove(camp_del)
        db.session.delete(camp_del)
        if sent_req_to_infl:
            db.session.delete(sent_req_to_infl)
        if sent_req_to_spons:
            db.session.delete(sent_req_to_spons)
        try:
            db.session.commit()
            return jsonify({'camp deleted ': camp_del.name}), 200
        except Exception:
            db.session.rollback()
            return jsonify({"message": 'Could not delete'}), 408

    @app.route('/update_campaigns/<id>', methods=['PUT'])
    @roles_required("spons")
    def update_campaigns(id):
        cache.clear()
        print('update campaign')
        SpF = db.session.query(
            sponsor_features).filter_by(user_id=current_user.id).first()
        current_camp = campaigns.query.filter(
            (campaigns.id == id) & (campaigns.s_id == current_user.id)).first()

        if not current_camp:
            return jsonify({'message': 'No such campaign with this id'}), 404

        data = request.get_json()
        print(data)
        name = data.get("name")
        description = data.get("description")
        startDate = ""
        if data.get("startDate"):
            startDate = datetime.strptime(data.get("startDate"), '%Y-%m-%d')
        endDate = ""
        if data.get("endDate"):
            endDate = datetime.strptime(data.get("endDate"), '%Y-%m-%d')
        budget = data.get("budget")
        goal = data.get("goal")
        visibility = data.get("visibility")
        # return jsonify(data)
        print(startDate, endDate)
        if name:
            current_camp.name = name
        if description:
            current_camp.description = description
        if startDate:
            print('inside start date')
            current_camp.start_date = startDate
        if endDate:
            current_camp.end_date = endDate
        if budget:
            current_camp.budget = budget
        if goal:
            current_camp.goals = goal
        if visibility != "":
            current_camp.visibility = visibility
        print(current_camp.start_date)
        # find the index of current campaign
        i = SpF.campaigns.index(current_camp)
        SpF.campaigns = SpF.campaigns[:i]+[current_camp]+SpF.campaigns[i+1:]
        try:
            db.session.commit()
            return jsonify({'message': 'Campaign Updated', "Campaign": current_camp.name, 'visibility': current_camp.visibility}), 200
        except:
            print('error while updating')
            db.session.rollback()
            return jsonify({'message': 'error while updating campaign'}), 408

    @app.route('/get_campaign/<id>', methods=['GET'])
    @roles_required("spons")
    def get_campaign(id):
        SpF = db.session.query(
            sponsor_features).filter_by(user_id=current_user.id).first()
        camp = campaigns.query.filter(
            (campaigns.id == id) & (campaigns.s_id == current_user.id)).first()
        return jsonify({'name': camp.name, 'description': camp.description,
                        'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                        'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                        'flag': camp.flag, 'id': camp.id})

    @app.route('/get_all_campaigns', methods=['GET'])
    @roles_accepted("admin", "infl")
    def get_all_campaign():
        camps = campaigns.query.all()
        camp_array = []
        for camp in camps:
            sponsor = user_datastore.find_user(id=camp.s_id)
            sname = sponsor.fname+' '+sponsor.lname
            if camp.visibility and current_user.roles[0].name == 'infl':
                camp_array.append({'name': camp.name, 'description': camp.description,
                                   'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                                   'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                                   'flag': camp.flag, 'id': camp.id, 'sponsor_id': camp.s_id, 'sponsor_name': sname})
            elif not camp.visibility and current_user.roles[0].name == 'infl':
                invisible = recieved_ad_req.query.filter(
                    (recieved_ad_req.infl_id == current_user.id) & (recieved_ad_req.campaign_id == camp.id)).first()
                if invisible:
                    # print(invisible)
                    camp_array.append({'name': camp.name, 'description': camp.description,
                                       'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                                       'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                                       'flag': camp.flag, 'id': camp.id, 'sponsor_id': camp.s_id, 'sponsor_name': sname})
            if current_user.roles[0].name == 'admin':
                camp_array.append({'name': camp.name, 'description': camp.description,
                                   'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                                   'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                                   'flag': camp.flag, 'id': camp.id, 'sponsor_id': camp.s_id, 'sponsor_name': sname})

        # print(camp_array)
        return jsonify(camp_array)

    @app.route('/send_ad_req_to_spons/<c_id>', methods=['GET'])
    @roles_accepted("infl")
    def send_req_to_spons(c_id):

        target_camp = campaigns.query.filter_by(id=c_id).first()
        if not target_camp:
            return jsonify({'message': 'No Such Campaign'}), 404
        sponsor_id = target_camp.s_id

        check1 = recieved_ad_req.query.filter((recieved_ad_req.campaign_id == c_id) & (
            recieved_ad_req.infl_id == current_user.id)).first()
        check2 = recieved_infl_req.query.filter(
            (recieved_infl_req.camp_id == c_id) & (recieved_infl_req.inf_id == current_user.id)).first()

        if check1 or check2:
            return jsonify({'message': 'Already Sent'}), 400

        req = recieved_infl_req(inf_id=current_user.id,
                                s_id=sponsor_id, camp_id=c_id)
        db.session.add(req)
        try:
            db.session.commit()
            return jsonify({"message": "sent req to spons"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'Could not send', 'error': e}), 408

    @app.route('/send_ad_req_to_infl/<c_id>/<infl_id>', methods=['GET'])
    @roles_accepted("spons")
    def send_req_to_infl(c_id, infl_id):
        print(c_id, infl_id)
        InF = influencer_features.query.filter_by(user_id=infl_id).first()

        if not InF:
            jsonify({"message": "no such influencer found"}), 404

        check1 = recieved_ad_req.query.filter((recieved_ad_req.campaign_id == c_id) & (
            recieved_ad_req.infl_id == infl_id)).first()
        check2 = recieved_infl_req.query.filter(
            (recieved_infl_req.camp_id == c_id) & (recieved_infl_req.inf_id == infl_id)).first()

        if check1 or check2:
            return jsonify({'message': 'Already Sent'}), 400

        req = recieved_ad_req(
            infl_id=infl_id, campaign_id=c_id, s_id=current_user.id)
        req.influencer_features.append(InF)
        db.session.add(req)
        try:
            db.session.commit()
            return jsonify({"message": "sent req to infl"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'Could not send', 'error': e}), 408

    @app.route('/get_all_req_to_inf', methods=['GET'])
    @auth_required('token')
    def get_all_req_infl():
        all_req = recieved_ad_req.query.all()
        if not all_req:
            jsonify({"message": "No req sent to influencers"}), 404
        reqs_json = []
        for req in all_req:
            InFs = req.influencer_features
            reqs_json.append({
                'id': req.id,
                'influencer_id': req.infl_id,
                'campaign_id': req.campaign_id,
                'sponsor_id': req.s_id,
                'status': req.status,
                'influencers': [inf.user_id for inf in InFs]
            })
        return jsonify(reqs_json), 200

    @app.route('/get_all_req_to_spons', methods=['GET'])
    @auth_required('token')
    def get_all_req_spons():
        all_req = recieved_infl_req.query.all()
        if not all_req:
            jsonify({"message": "No req sent to influencers"}), 404
        reqs_json = []
        for req in all_req:
            reqs_json.append({
                'id': req.id,
                'influencer_id': req.inf_id,
                'sponsor_id': req.s_id,
                'campaign_id': req.camp_id,
                'status': req.status
            })
        return jsonify(reqs_json), 200

    @app.route('/delete_req_to_spons/<id>', methods=['DELETE'])
    @auth_required('token')
    def delete_to_spons(id):
        cache.clear()
        target_req = recieved_infl_req.query.filter_by(id=id).first()
        if not target_req:
            return jsonify({"message": "No such request"}), 404
        db.session.delete(target_req)
        try:
            db.session.commit()
            return jsonify({"message": "req deleted"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'delete failed', 'error': e}), 408

    @app.route('/delete_req_to_infl/<id>', methods=['DELETE'])
    @auth_required('token')
    def delete_to_infl(id):
        cache.clear()
        target_req = recieved_ad_req.query.filter_by(id=id).first()
        if not target_req:
            return jsonify({"message": "No such request"}), 404
        db.session.delete(target_req)
        try:
            db.session.commit()
            return jsonify({"message": "req deleted"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'delete failed', 'error': e}), 408

    @app.route('/accept_req_to_spons/<id>', methods=['GET'])
    @roles_accepted("spons")
    def accept_to_spons(id):
        cache.clear()
        target_req = recieved_infl_req.query.filter_by(id=id).first()
        if not target_req:
            return jsonify({"message": "No such request"}), 404
        target_req.status = 'accepted'
        try:
            db.session.commit()
            return jsonify({"message": "req accepted"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'accepting failed', 'error': e}), 408

    @app.route('/reject_req_to_spons/<id>', methods=['GET'])
    @roles_accepted("spons")
    def reject_to_spons(id):
        cache.clear()
        target_req = recieved_infl_req.query.filter_by(id=id).first()
        if not target_req:
            return jsonify({"message": "No such request"}), 404
        target_req.status = 'rejected'
        try:
            db.session.commit()
            return jsonify({"message": "req rejected"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'reject failed', 'error': e}), 408

    @app.route('/accept_req_to_infl/<id>', methods=['GET'])
    @roles_accepted("infl")
    def accept_to_infl(id):
        cache.clear()
        target_req = recieved_ad_req.query.filter_by(id=id).first()
        if not target_req:
            return jsonify({"message": "No such request"}), 404
        target_req.status = 'accepted'
        try:
            db.session.commit()
            return jsonify({"message": "req accepted"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'accepting failed', 'error': e}), 408

    @app.route('/reject_req_to_infl/<id>', methods=['GET'])
    @roles_accepted("infl")
    def reject_to_infl(id):
        cache.clear()
        target_req = recieved_ad_req.query.filter_by(id=id).first()
        if not target_req:
            return jsonify({"message": "No such request"}), 404
        target_req.status = 'rejected'
        try:
            db.session.commit()
            return jsonify({"message": "req rejected"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": 'reject failed', 'error': e}), 408

    @app.route('/get_all_running', methods=['GET'])
    @auth_required('token')
    @cache.cached(timeout=50)
    def get_all_running():
        role = current_user.roles[0].name
        current_user_name = current_user.fname+' '+current_user.lname
        if role == 'spons':
            running_to_infl = recieved_ad_req.query.filter((recieved_ad_req.s_id == current_user.id) &
                                                           (recieved_ad_req.status == 'accepted')).all()
            running_to_spons = recieved_infl_req.query.filter((recieved_infl_req.s_id == current_user.id) &
                                                              (recieved_infl_req.status == 'accepted')).all()
        elif role == 'infl':
            running_to_infl = recieved_ad_req.query.filter((recieved_ad_req.infl_id == current_user.id) &
                                                           (recieved_ad_req.status == 'accepted')).all()
            running_to_spons = recieved_infl_req.query.filter((recieved_infl_req.inf_id == current_user.id) &
                                                              (recieved_infl_req.status == 'accepted')).all()
        elif role == 'admin':
            running_to_infl = recieved_ad_req.query.filter_by(
                status='accepted').all()
            running_to_spons = recieved_infl_req.query.filter_by(
                status='accepted').all()

        if not running_to_infl and not running_to_spons:
            return jsonify({'message': 'nothing is runnign'}), 404

        camp_array = []
        if running_to_infl:
            for r_to_i in running_to_infl:
                camp = campaigns.query.filter_by(id=r_to_i.campaign_id).first()
                sponsor = user_datastore.find_user(id=camp.s_id)
                influencer = user_datastore.find_user(id=r_to_i.infl_id)
                sname = sponsor.fname+' '+sponsor.lname
                inf_name = influencer.fname+' '+influencer.lname
                InF = db.session.query(
                    influencer_features).filter_by(user_id=influencer.id).first()
                SpF = db.session.query(
                    sponsor_features).filter_by(user_id=sponsor.id).first()

                camp_array.append({'name': camp.name, 'description': camp.description,
                                   'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                                   'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                                   'flag': camp.flag, 'id': camp.id, 'sponsor_id': camp.s_id, 'sponsor_name': sname,
                                   'influencer_id': influencer.id, 'influencer_name': inf_name, 'sponsor_active': sponsor.active,
                                   'influencer_active': influencer.active, 'sponsor_flag': SpF.flag, 'influencer_flag': InF.flag,
                                   'current_user_role': role, 'current_user_name': current_user_name})
        if running_to_spons:
            for r_to_s in running_to_spons:
                camp = campaigns.query.filter_by(id=r_to_s.camp_id).first()
                sponsor = user_datastore.find_user(id=camp.s_id)
                influencer = user_datastore.find_user(id=r_to_s.inf_id)
                sname = sponsor.fname+' '+sponsor.lname
                inf_name = influencer.fname+' '+influencer.lname
                InF = db.session.query(
                    influencer_features).filter_by(user_id=influencer.id).first()
                SpF = db.session.query(
                    sponsor_features).filter_by(user_id=sponsor.id).first()

                camp_array.append({'name': camp.name, 'description': camp.description,
                                   'start_date': str(camp.start_date.date()), 'end_date': str(camp.end_date.date()),
                                   'budget': camp.budget, 'goals': camp.goals, 'visibility': camp.visibility,
                                   'flag': camp.flag, 'id': camp.id, 'sponsor_id': camp.s_id, 'sponsor_name': sname,
                                   'influencer_id': influencer.id, 'influencer_name': inf_name, 'sponsor_active': sponsor.active,
                                   'influencer_active': influencer.active, 'sponsor_flag': SpF.flag, 'influencer_flag': InF.flag,
                                   'current_user_role': role, 'current_user_name': current_user_name})
        return jsonify(camp_array), 200

    @app.route('/celerydemo')
    def celery_demo():
        task = add.delay(10, 20)
        return jsonify({'task_id': task.id})

    @app.route('/celerytask/<task_id>')
    def celerytask(task_id):
        task_result = AsyncResult(task_id)

        if task_result.ready():
            return jsonify({'data': task_result.result}), 200
        else:
            return jsonify({'message': 'data not ready'}), 405

    @app.route('/start-export')
    @auth_required('token')
    def start_export():
        role = current_user.roles[0].name
        id = current_user.id
        task = export_csv.delay(role, id)
        return jsonify({'task_id': task.id}), 200

    @app.route('/download-export/<task_id>')
    @auth_required('token')
    def download_export(task_id):
        task_result = AsyncResult(task_id)
        if task_result.ready():
            return send_file('./downloads/file.csv', mimetype="application/csv", as_attachment=True), 200
        else:
            return jsonify({'message': 'task not ready'}), 405

    @app.route('/get_all_pending_all_inf')
    def get_all_pending_all_inf():
        all_users = User.query.all()
        print(all_users)
        all_infls = []
        for user in all_users:
            role = user.roles[0].name
            if role == 'infl':
                all_infls.append(user)

        print(all_infls)

        Dic_all_inf_pend = {}
        for infl in all_infls:
            running_to_infl = recieved_ad_req.query.filter((recieved_ad_req.infl_id == infl.id) &
                                                           (recieved_ad_req.status == 'pending')).all()
            running_to_spons = recieved_infl_req.query.filter((recieved_infl_req.inf_id == infl.id) &
                                                              (recieved_infl_req.status == 'pending')).all()
            if not running_to_infl and not running_to_spons:
                continue

            inf_name = infl.fname+' '+infl.lname
            Dic_all_inf_pend[inf_name] = []
            if running_to_infl:
                for r_to_i in running_to_infl:
                    camp = campaigns.query.filter_by(
                        id=r_to_i.campaign_id).first()

                    sponsor = User.query.filter_by(id=camp.s_id).first()

                    sname = sponsor.fname+' '+sponsor.lname

                    dic_inner = {'influecer_mail': infl.email, 'campaign_name': camp.name, 'campaign_budget': camp.budget,
                                 'sponsor_name': sname}
                    Dic_all_inf_pend[inf_name].append(dic_inner)

            if running_to_spons:
                for r_to_s in running_to_spons:
                    camp = campaigns.query.filter_by(id=r_to_s.camp_id).first()
                    sponsor = User.query.filter_by(id=camp.s_id).first()
                    sname = sponsor.fname+' '+sponsor.lname

                    dic_inner = {'influecer_mail': infl.email, 'campaign_name': camp.name, 'campaign_budget': camp.budget,
                                 'sponsor_name': sname}
                    Dic_all_inf_pend[inf_name].append(dic_inner)

        if len(Dic_all_inf_pend) == 0:
            return {'message': 'nothing is pending'}, 404

        return jsonify(Dic_all_inf_pend)

    @app.route('/get_all_camps_all_spons')
    def get_all_camps_all_spons():
        all_users = User.query.all()
        print(all_users)
        all_spons = []
        for user in all_users:
            role = user.roles[0].name
            if role == 'spons':
                all_spons.append(user)

        print(all_spons)

        Dic_all_spons_camps = {}
        for spons in all_spons:
            running_to_infl = recieved_ad_req.query.filter_by(
                s_id=spons.id).all()
            running_to_spons = recieved_infl_req.query.filter_by(
                s_id=spons.id).all()
            if not running_to_infl and not running_to_spons:
                continue

            spons_name = spons.fname+' '+spons.lname
            Dic_all_spons_camps[spons_name] = []
            if running_to_infl:
                for r_to_i in running_to_infl:
                    camp = campaigns.query.filter_by(
                        id=r_to_i.campaign_id).first()

                    influencer = User.query.filter_by(
                        id=r_to_i.infl_id).first()
                    inf_name = influencer.fname+' '+influencer.lname
                    InF = db.session.query(
                        influencer_features).filter_by(user_id=influencer.id).first()
                    inf_about = InF.aboutMe

                    Prog_f = None
                    paid = None
                    if r_to_i.status == 'accepted':
                        Prog_f = Calc_progress(camp.start_date, camp.end_date)
                        paid = math.floor(Prog_f*10)*camp.budget/10
                        Prog_f = round(Prog_f*100, 2)

                    dic_inner = {'sponsor_mail': spons.email, 'campaign_name': camp.name, 'campaign_budget': camp.budget,
                                 'influencer_name': inf_name, 'visibility': camp.visibility,
                                 'status': r_to_i.status, 'influencer_details': inf_about,
                                 'progress': Prog_f, 'already_paid': paid}
                    Dic_all_spons_camps[spons_name].append(dic_inner)

            if running_to_spons:
                for r_to_s in running_to_spons:
                    camp = campaigns.query.filter_by(id=r_to_s.camp_id).first()
                    sponsor = User.query.filter_by(id=camp.s_id).first()
                    sname = sponsor.fname+' '+sponsor.lname
                    influencer = User.query.filter_by(id=r_to_s.inf_id).first()
                    inf_name = influencer.fname+' '+influencer.lname
                    InF = db.session.query(
                        influencer_features).filter_by(user_id=influencer.id).first()
                    inf_about = InF.aboutMe
                    Prog_f = None
                    paid = None
                    if r_to_s.status == 'accepted':
                        Prog_f = Calc_progress(camp.start_date, camp.end_date)
                        paid = math.floor(Prog_f*10)*camp.budget/10
                        Prog_f = round(Prog_f*100, 2)

                    dic_inner = {'sponsor_mail': spons.email, 'campaign_name': camp.name, 'campaign_budget': camp.budget,
                                 'influencer_name': inf_name, 'visibility': camp.visibility,
                                 'status': r_to_s.status, 'influencer_details': inf_about,
                                 'progress': Prog_f, 'already_paid': paid}
                    Dic_all_spons_camps[spons_name].append(dic_inner)

        if len(Dic_all_spons_camps) == 0:
            return {'message': 'no ad requests found'}, 404

        return jsonify(Dic_all_spons_camps)
