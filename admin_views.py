from flask import jsonify, render_template, render_template_string, request, send_file
from flask_security import auth_required, current_user, roles_required, roles_accepted, SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extentions import db
from helper_functions import get_or_create, get_or_create_features
import datetime

from models import influencer_features, sponsor_features

def create_admin_views(app, user_datastore: SQLAlchemyUserDatastore):
    @app.route('/users/<role>',methods=['GET'])
    @roles_required('admin')
    def get_influencers(role):
        print(role)
        all_users = user_datastore.user_model().query.all()
        filtered_users=[]
        if role=='infl':
            for user in all_users:
                if role in user.roles:
                        InF = db.session.query(
                            influencer_features).filter_by(user_id=user.id).first()
                        # print(InF.plateforms)
                        pltnames = [p.name for p in InF.plateforms]
                        data = {'id': user.id,
                                "fname":user.fname,
                                "lname":user.lname,
                                "plateforms":pltnames,
                                "email":user.email,
                                "flag": InF.flag, }
                        filtered_users.append(data)
        elif role=='spons':
            for user in all_users:
                if role in user.roles:
                    SpF = sponsor_features.query.filter_by(user_id=user.id).first()
                    data = {'id': user.id,
                            "fname": user.fname,
                            "lname": user.lname,
                            "industry": SpF.industry,
                            "flag":SpF.flag,
                            "email": user.email,
                            "active":user.active}
                    filtered_users.append(data)
        print(filtered_users)

        if not filtered_users:
             return jsonify({'message':'no user found'}),404
        return jsonify(filtered_users),200
    
    @roles_required('admin')
    @app.route('/inactive_sponsors', methods=['GET'])
    def get_inactive_sponsors():
        # Query for all users
        all_users = user_datastore.user_model().query.all()

        # Filter users to get only inactive instructors
        inactive_sponsors = [
            user for user in all_users
            if not user.active and any(role.name == 'spons' for role in user.roles)
        ]

        # Prepare the response data
        results = [
            {
                'id': user.id,
                'email': user.email,
                "fname": user.fname,
                "lname": user.lname,
                "flag": sponsor_features.query.filter_by(user_id=user.id).first().flag
            }
            for user in inactive_sponsors
        ]

        return jsonify(results), 200

    @roles_required('admin')
    @app.route('/activate_spons/<id>')
    def activate_inst(id):

        user = user_datastore.find_user(id=id)
        if not user:
            return jsonify({'message': 'user not present'}), 404

        # check if inst already activated
        if (user.active == True):
            return jsonify({'message': 'user already active'}), 400

        user.active = True
        db.session.commit()
        return jsonify({'message': 'user is activated'}), 200
