import os
import time
import math


from extentions import db
from mail_service import send_email
from models import influencer_features, sponsor_features, campaigns
from models import recieved_infl_req, recieved_ad_req, User

from celery import shared_task
import flask_excel as excel

from helper_functions import Calc_progress, CreateEmailTemplate_monthly, CreateEmailTemplate_pending


@shared_task()
def add(x, y):
    time.sleep(15)
    return x+y


def get_all_running_dic(role, id):
    if role == 'spons':
        running_to_infl = recieved_ad_req.query.filter((recieved_ad_req.s_id == id) &
                                                       (recieved_ad_req.status == 'accepted')).all()
        running_to_spons = recieved_infl_req.query.filter((recieved_infl_req.s_id == id) &
                                                          (recieved_infl_req.status == 'accepted')).all()
    elif role == 'infl':
        running_to_infl = recieved_ad_req.query.filter((recieved_ad_req.infl_id == id) &
                                                       (recieved_ad_req.status == 'accepted')).all()
        running_to_spons = recieved_infl_req.query.filter((recieved_infl_req.inf_id == id) &
                                                          (recieved_infl_req.status == 'accepted')).all()
    elif role == 'admin':
        running_to_infl = recieved_ad_req.query.filter_by(
            status='accepted').all()
        running_to_spons = recieved_infl_req.query.filter_by(
            status='accepted').all()

    if not running_to_infl and not running_to_spons:
        return {'message': 'nothing is runnign'}

    camp_dic = {'name': [], 'description': [],
                'start_date': [], 'end_date': [],
                'budget': [], 'goals': [], 'visibility': [],
                'flag': [], 'id': [], 'sponsor_id': [], 'sponsor_name': [],
                'influencer_id': [], 'influencer_name': [], 'sponsor_active': [],
                'influencer_active': [], 'sponsor_flag': [], 'influencer_flag': [], 'current_user_role': [],
                'progress_%': [], 'already_paid': []}
    if running_to_infl:
        for r_to_i in running_to_infl:
            camp = campaigns.query.filter_by(id=r_to_i.campaign_id).first()

            sponsor = User.query.filter_by(id=camp.s_id).first()
            influencer = User.query.filter_by(id=r_to_i.infl_id).first()

            sname = sponsor.fname+' '+sponsor.lname
            inf_name = influencer.fname+' '+influencer.lname
            InF = db.session.query(
                influencer_features).filter_by(user_id=influencer.id).first()
            SpF = db.session.query(
                sponsor_features).filter_by(user_id=sponsor.id).first()

            Prog_f = Calc_progress(camp.start_date, camp.end_date)
            paid = math.floor(Prog_f*10)*camp.budget/10
            # print(camp.name)
            camp_dic['name'].append(camp.name)
            camp_dic['description'].append(camp.description)
            camp_dic['start_date'].append(str(camp.start_date.date()))
            camp_dic['end_date'].append(str(camp.end_date.date()))
            camp_dic['budget'].append(camp.budget)
            camp_dic['goals'].append(camp.goals)
            camp_dic['visibility'].append(camp.visibility)
            camp_dic['flag'].append(camp.flag)
            camp_dic['id'].append(camp.id)
            camp_dic['sponsor_id'].append(camp.s_id)
            camp_dic['sponsor_name'].append(sname)
            camp_dic['influencer_id'].append(influencer.id)
            camp_dic['influencer_name'].append(inf_name)
            camp_dic['sponsor_active'].append(sponsor.active)
            camp_dic['influencer_active'].append(influencer.active)
            camp_dic['sponsor_flag'].append(SpF.flag)
            camp_dic['influencer_flag'].append(InF.flag)
            camp_dic['current_user_role'].append(role)
            camp_dic['progress_%'].append(round(Prog_f*100, 2))
            camp_dic['already_paid'].append(round(paid, 2))

    if running_to_spons:
        for r_to_s in running_to_spons:
            camp = campaigns.query.filter_by(id=r_to_s.camp_id).first()
            sponsor = User.query.filter_by(id=camp.s_id).first()
            influencer = User.query.filter_by(id=r_to_s.inf_id).first()
            sname = sponsor.fname+' '+sponsor.lname
            inf_name = influencer.fname+' '+influencer.lname
            InF = db.session.query(
                influencer_features).filter_by(user_id=influencer.id).first()
            SpF = db.session.query(
                sponsor_features).filter_by(user_id=sponsor.id).first()

            Prog_f = Calc_progress(camp.start_date, camp.end_date)
            paid = math.floor(Prog_f*10)*camp.budget/10

            camp_dic['name'].append(camp.name)
            camp_dic['description'].append(camp.description)
            camp_dic['start_date'].append(str(camp.start_date.date()))
            camp_dic['end_date'].append(str(camp.end_date.date()))
            camp_dic['budget'].append(camp.budget)
            camp_dic['goals'].append(camp.goals)
            camp_dic['visibility'].append(camp.visibility)
            camp_dic['flag'].append(camp.flag)
            camp_dic['id'].append(camp.id)
            camp_dic['sponsor_id'].append(camp.s_id)
            camp_dic['sponsor_name'].append(sname)
            camp_dic['influencer_id'].append(influencer.id)
            camp_dic['influencer_name'].append(inf_name)
            camp_dic['sponsor_active'].append(sponsor.active)
            camp_dic['influencer_active'].append(influencer.active)
            camp_dic['sponsor_flag'].append(SpF.flag)
            camp_dic['influencer_flag'].append(InF.flag)
            camp_dic['current_user_role'].append(role)
            camp_dic['progress_%'].append(round(Prog_f*100, 2))
            camp_dic['already_paid'].append(round(paid, 2))
    return camp_dic


@shared_task(ignore_result=False)
def export_csv(role, id):
    time.sleep(2)
    dic = get_all_running_dic(role, id)
    if role == 'spons':
        columns = ['name', 'description',
                   'budget', 'influencer_name', 'visibility', 'start_date', 'end_date', 'progress_%', 'already_paid']
    elif role == 'infl':
        columns = ['name', 'description',
                   'budget', 'sponsor_name', 'progress_%', 'already_paid']
    elif role == 'admin':
        columns = ['name', 'description',
                   'budget', 'influencer_name', 'sponsor_name', 'progress_%']
    filter_dic = {}
    for key in columns:
        filter_dic[key] = dic[key]
    csv_out = excel.make_response_from_dict(
        filter_dic,  file_type='csv')
    # csv_out = excel.make_response_from_array(
    #     [dic['name'], dic['progress_%'], dic['already_paid']], columns=['name', 'progress'],  file_type='csv')
    # print(csv_out.data)
    if not os.path.exists("./downloads"):
        os.makedirs("./downloads")
    with open('./downloads/file.csv', 'wb') as file:
        file.write(csv_out.data)
    return "file.csv"


def get_all_pending_all_inf():
    all_users = User.query.all()
    # print(all_users)
    all_infls = []
    for user in all_users:
        role = user.roles[0].name
        if role == 'infl':
            all_infls.append(user)

    # print(all_infls)

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

    return Dic_all_inf_pend


def get_all_camps_all_spons():
    all_users = User.query.all()
    # print(all_users)
    all_spons = []
    for user in all_users:
        role = user.roles[0].name
        if role == 'spons':
            all_spons.append(user)

    # print(all_spons)

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

    return Dic_all_spons_camps


@shared_task()
def pending_requests_reminder(message):
    Dic_all_inf_pend = get_all_pending_all_inf()
    print(len(Dic_all_inf_pend))
    if len(Dic_all_inf_pend) > 0:
        for name, contents in Dic_all_inf_pend.items():
            # print(contents)
            send_email(contents[0]['influecer_mail'], message,
                       CreateEmailTemplate_pending(name=name, contents=contents))
        return "OK"
    return 'not sent'


@shared_task()
def monthly_report(message):
    Dic_all_spons_camps = get_all_camps_all_spons()
    print(len(Dic_all_spons_camps))
    if len(Dic_all_spons_camps) > 0:
        for name, contents in Dic_all_spons_camps.items():
            # print(contents)
            send_email(contents[0]['sponsor_mail'], message,
                       CreateEmailTemplate_monthly(name=name, contents=contents))
        return "OK"
    return 'not sent'
