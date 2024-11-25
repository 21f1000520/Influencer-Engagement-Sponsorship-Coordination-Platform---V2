from flask import jsonify, render_template, render_template_string, request, send_file
from flask_security import auth_required, current_user, roles_required, roles_accepted, SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extentions import db
from helper_functions import get_or_create,get_or_create_features
import datetime

from models import platforms,influencer_features,sponsor_features

def create_entery_view(app, user_datastore: SQLAlchemyUserDatastore):

    @app.route('/')
    def home():
        return render_template('index.html')

    @app.route('/user_login', methods=['POST'])
    def user_login():
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        print(email,password)
        if not email or not password:
            return jsonify({'message': 'not valid email or password'}), 404

        user = user_datastore.find_user(email=email)
        print(user)

        if not user:
            print('user not found')
            return jsonify({'message': 'invalid user'}), 404
        if not user.active:
            print('user inactive')
            return jsonify({'message': 'User not activated'}), 404

        if verify_password(password, user.password):
            return jsonify({'token': user.get_auth_token(), 'role': user.roles[0].name, 'id': user.id, 'email': user.email}), 200
        else:
            return jsonify({'message': 'wrong password'}),404

    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        print(data)
        fname = data.get('fname')
        lname = data.get('lname')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        print(fname,lname,email,password,role)

        if not email or not password or role not in ['spons', 'infl']:
            return jsonify({"message": "invalid input"})

        if user_datastore.find_user(email=email):
            return jsonify({"message": "user already exists"})

        # sponser is not active by default
        if role == 'spons':
            active = False
            industry = data.get('industry')
            print(industry)
        elif role == 'infl':
            active = True
            platforms_dic = data.get('platforms')
            aboutMe = data.get('aboutMe')
            if platforms_dic:
                plt_objs=[]
                for plt in platforms_dic:
                    plt_obj = get_or_create(db.session, platforms, name=plt)
                    plt_objs.append(plt_obj)
            
        try:
            user_datastore.create_user(fname=fname, lname=lname, email=email, password=hash_password(
                password), roles=[role], active=active)
            if role=='infl':
                influencer = user_datastore.find_user(
                    email=email)
                print(influencer)
                InF = get_or_create_features(db.session, influencer_features, plateforms=plt_objs, 
                                             user_id=influencer.id, aboutMe=aboutMe)
            elif role=='spons':
                sponsor = user_datastore.find_user(
                    email=email)
                print(sponsor)
                SpF = get_or_create(db.session, sponsor_features, user_id=sponsor.id, industry=industry)
            db.session.commit()
        except:
            print('error while creating')
            db.session.rollback()
            return jsonify({'message': 'error while creating user'}), 408

        return jsonify({'message': 'user created'}), 200

    

