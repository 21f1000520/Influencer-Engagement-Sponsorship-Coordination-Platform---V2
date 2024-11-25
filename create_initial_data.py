from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extentions import db
from models import platforms,influencer_features,sponsor_features
from helper_functions import get_or_create,get_or_create_features




def create_data(user_datastore: SQLAlchemyUserDatastore):
    print('------- Creating Initial Data--------')

    # create roles
    user_datastore.find_or_create_role(
        name='admin', description="Administrator")
    user_datastore.find_or_create_role(name='spons', description="Sponsor")
    user_datastore.find_or_create_role(name='infl', description="Influencer")

    Instagram=get_or_create(db.session, platforms, name='Instagram')
    Twitter=get_or_create(db.session, platforms, name='Twitter')
    Youtube=get_or_create(db.session, platforms, name='Youtube')
    
    print('=== created roles and plateforms ===')
    if not user_datastore.find_user(email="admin@iitm.ac.in"):
        print('not found admin')
        user_datastore.create_user(fname='ADMIN', lname='ADMIN',
            email="admin@iitm.ac.in", password=hash_password('1234'), active=True, roles=['admin'])
    if not user_datastore.find_user(email="influencer@iitm.ac.in"):
        user_datastore.create_user(fname='First', lname='Influencer',
            email="influencer@iitm.ac.in", password=hash_password('1234'), active=True, roles=['infl'])
        influencer = user_datastore.find_user(email="influencer@iitm.ac.in")
        # print(influencer)
        InF = get_or_create_features(db.session, influencer_features,plateforms=[Youtube,Instagram], user_id=influencer.id,aboutMe='I am a Youtuber and Instagrammer')
    if not user_datastore.find_user(email="sponsor@iitm.ac.in"):
        user_datastore.create_user(fname='First', lname='Sponsor',
            email="sponsor@iitm.ac.in", password=hash_password('1234'), active=True, roles=['spons'])
        sponsor = user_datastore.find_user(email="sponsor@iitm.ac.in")
        # print(influencer)
        SpF = get_or_create(db.session, sponsor_features, user_id=sponsor.id,industry='Electronics')
    print('=== created users ===')

    
    # print(InF.plateforms)
    # db.session.add(InF)
    db.session.commit()


