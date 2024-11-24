from flask import jsonify, render_template, render_template_string, request, send_file
from flask_security import auth_required, current_user, roles_required, roles_accepted, SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extentions import db

import datetime


def create_view(app, user_datastore: SQLAlchemyUserDatastore):

    @app.route('/')
    def home():
        return render_template('index.html')

    @app.route('/user-login', methods=['POST'])
    def user_login():

        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'not valid email or password'}), 404

        user = user_datastore.find_user(email=email)

        if not user:
            return jsonify({'message': 'invalid user'}), 404

        if verify_password(password, user.password):
            return jsonify({'token': user.get_auth_token(), 'role': user.roles[0].name, 'id': user.id, 'email': user.email}), 200
        else:
            return jsonify({'message': 'wrong password'})
