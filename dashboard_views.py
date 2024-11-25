from flask import jsonify, render_template, render_template_string, request, send_file
from flask_security import auth_required, current_user, roles_required, roles_accepted, SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extentions import db
from helper_functions import get_or_create, get_or_create_features
import datetime
import os
from models import influencer_features, sponsor_features,platforms


def create_dashboard_views(app, user_datastore: SQLAlchemyUserDatastore):
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
                    "role":role,
                    'dp_name':SpF.dp_name}
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
                    "role":role,
                    "aboutMe":InF.aboutMe,
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
        InF.dp_name=filename
        db.session.commit()
        if file:
            print(file,filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({'message':'uploaded'}),200

    @app.route('/update_user', methods=['PUT'])
    @auth_required('token')
    def update_user():
        print(current_user)
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
    