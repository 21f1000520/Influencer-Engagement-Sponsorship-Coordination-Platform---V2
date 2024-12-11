
from datetime import datetime
from jinja2 import Template


def get_or_create(session, model, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    elif not instance:
        instance = model(**kwargs)
        session.add(instance)
        return instance


def get_or_create_features(session, model, plateforms, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        print('found')
        return instance
    elif not instance:
        instance = model(**kwargs)
        instance.plateforms.extend(plateforms)
        session.add(instance)
        return instance


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


def CreateEmailTemplate_pending(name, contents):
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
                    <th>Offered Amount ( &#x20b9 )</th>
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


def CreateEmailTemplate_monthly(name, contents):
    temp = """
        <!DOCTYPE html>
        <html>
        <head>
        <title>Monthly Activity</title>
        <style>
            body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            }
            .email-container {
            max-width: 60%;
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
                Thank you for being a valueable member of our plateform! As a part of our promise we are happy to share 
                the monthly activity report on your ad campaigns.
                
            </p>
            <p>
                Below is your monthly report of all the ad campaigns that you ran till this month:
            </p>
            <div class="table-section">
                <table>
                <thead>
                    <tr>
                    <th>Ad Name</th>
                    <th>Influencer Targetted</th>
                    <th>Influencer Details</th>
                    <th>Offered Amount ( &#x20b9 )</th>
                    <th>Request Status</th>
                    <th>Progress</th>
                    <th>Already Paid ( &#x20b9 )</th>
                    </tr>
                </thead>
                <tbody>
                {% for content in contents %}
                    <tr>
                    <td>{{ content.campaign_name }}</td>
                    <td>{{ content.influencer_name }}</td>
                    <td>{{ content.influencer_details }}</td>
                    <td>{{ content.campaign_budget }}</td>
                    <td>{{ content.status }}</td>
                    {% if content.progress %}
                        <td>{{ content.progress }}</td>
                        <td>{{ content.already_paid }}</td>
                    {% else %}
                        <td> -- </td>
                        <td> -- </td>
                    {% endif %}
                    </tr>
                {% endfor %}
                </tbody>
                </table>
            </div>
            <p>
                Please visit your dashboard and stats page to get more details
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
