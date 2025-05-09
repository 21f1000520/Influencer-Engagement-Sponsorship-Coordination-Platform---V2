import os
from flask import Flask

import entry_views
import admin_views
import dashboard_views

from create_initial_data import create_data
from extentions import db, security, cache

from celery.schedules import crontab
from worker import celery_init_app
from tasks import pending_requests_reminder, monthly_report

import flask_excel as excel

basedir = os.path.abspath(os.path.dirname(__file__))


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = "should-not-be-exposed"
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
    app.config['SECURITY_PASSWORD_SALT'] = 'salty-password'
    app.config['UPLOAD_FOLDER'] = os.path.join(basedir, "static/images")

    # configure token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600  # 1hr
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

    # cache config
    app.config["CACHE_DEFAULT_TIMEOUT"] = 300
    app.config["CACHE_TYPE"] = "RedisCache"
    app.config["CACHE_REDIS_PORT"] = 6379

    app.config["DEBUG"] = True         # some Flask specific configs

    cache.init_app(app)
    db.init_app(app)

    with app.app_context():
        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role)
        security.init_app(app, user_datastore)
        db.create_all()
        create_data(user_datastore)
    # disable CSRF security
    app.config['WTF_CSRF_CHECK_DEFAULT'] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISHMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True

    entry_views.create_entery_view(app, user_datastore, cache)
    admin_views.create_admin_views(app, user_datastore, cache)
    dashboard_views.create_dashboard_views(app, user_datastore, cache)
    return app, user_datastore


app, user_datastore = create_app()
celery_app = celery_init_app(app)
excel.init_excel(app)


@celery_app.on_after_configure.connect
def schedule_tasks(sender, **kwargs):

    # sender.add_periodic_task(60.0, pending_requests_reminder.s(
    #     'Pending Requests'), name='add every 60 seconds')
    sender.add_periodic_task(crontab(hour=19, minute=50, day_of_week='1-6'),
                             pending_requests_reminder.s('Pending Requests'), name='Daily Reminder Pending Requests')
    sender.add_periodic_task(crontab(hour=19, minute=50, day_of_month='29'),
                             monthly_report.s('Monthly Activity Report'), name='Monthly activity report')


if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host='0.0.0.0', port='7000', debug=True)
