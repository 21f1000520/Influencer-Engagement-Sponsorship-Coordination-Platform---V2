from celery import shared_task
import time
from models import influencer_features, sponsor_features, campaigns
from models import recieved_infl_req, recieved_ad_req, User
import math
from extentions import db
import flask_excel as excel
import os
from datetime import datetime


@shared_task()
def add(x, y):
    time.sleep(15)
    return x+y


def Calc_progress(start: datetime, end: datetime):
    t_start = start.timestamp()
    t_end = end.timestamp()
    # print(start, end)
    duration = t_end-t_start
    now = datetime.now().timestamp()
    spent = now-t_start
    frac = (spent)/duration
    # print('duration', duration, 'now', now, "spent", spent, "t_start", t_start)
    if frac >= 1:
        frac = 1
    return frac


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
    dic = get_all_running_dic(role, id)
    if role == 'spons':
        columns = ['name', 'description',
                   'budget', 'influencer_name', 'progress_%', 'already_paid']
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
