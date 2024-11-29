from celery import shared_task
import time
from models import influencer_features, sponsor_features, campaigns
from models import recieved_infl_req, recieved_ad_req, User
import math
from extentions import db
import flask_excel as excel
import os
from datetime import datetime
from mail_service import send_email
from flask import jsonify
from jinja2 import Template


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


def CreateEmailTemplate(name, contents):
    temp = """
        <!DOCTYPE html>
        <html>
        <head>
        <title>Pending Requests Reminder</title>
        <style>
            body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            }
            .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
            text-align: center;
            padding: 10px 0;
            background: #007bff;
            color: #ffffff;
            border-radius: 8px 8px 0 0;
            }
            .content {
            padding: 20px;
            line-height: 1.6;
            color: #333333;
            }
            .table-section {
            margin: 20px 0;
            }
            table {
            width: 100%;
            border-collapse: collapse;
            }
            table th, table td {
            padding: 10px;
            text-align: left;
            border: 1px solid #dddddd;
            }
            table th {
            background-color: #007bff;
            color: #ffffff;
            }
            .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777777;
            }
            a {
            color: #007bff;
            text-decoration: none;
            }
            a:hover {
            text-decoration: underline;
            }
            .button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            }
            .button:hover {
            background: #0056b3;
            }
        </style>
        </head>
        <body>
        <div class="email-container">
            <div class="header">
            <h1>Influencer Sponsor Plateform</h1>
            </div>
            <div class="content">
            <h2>Dear {{name}},</h2>
            <p>
                Thank you for being a valueable member of our plateform! 
                We are excited to share that you have pending ad request which you have not looked at.
            </p>
            <p>
                Below is a summary of your pending requests:
            </p>
            <div class="table-section">
                <table>
                <thead>
                    <tr>
                    <th>Ad Name</th>
                    <th>Sponsored By</th>
                    <th>Offered Amount</th>
                    </tr>
                </thead>
                <tbody>
                {% for content in contents %}
                    <tr>
                    <td>{{ content.campaign_name }}</td>
                    <td>{{ content.sponsor_name }}</td>
                    <td>{{ content.campaign_budget }}</td>
                    </tr>
                {% endfor %}
                </tbody>
                </table>
            </div>
            <p>
                To learn more about other requests please visit your dashboard
            </p>
            <p>
            <strong>Regards</strong>
            </p>
            <p>
            Plateform Team
            </p>
            </div>
            <div class="footer">
            <p>
                &copy; 2024 Influencer Sponsor Plateform
            </p>
            </div>
        </div>
        </body>
        </html>

    """
    template = Template(temp)
    return template.render(name=name, contents=contents)


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


@shared_task()
def pending_requests_reminder(message):
    Dic_all_inf_pend = get_all_pending_all_inf()
    print(len(Dic_all_inf_pend))
    if len(Dic_all_inf_pend) > 0:
        for name, contents in Dic_all_inf_pend.items():
            # print(contents)
            send_email(contents[0]['influecer_mail'], message,
                       CreateEmailTemplate(name=name, contents=contents))
        return "OK"
    return 'not sent'
