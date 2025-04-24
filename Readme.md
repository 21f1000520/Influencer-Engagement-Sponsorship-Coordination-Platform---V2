
# Influencer Engagement & Sponsorship Coordination Platform - V2

A full-stack application that bridges Sponsors and Influencers, enabling Sponsors to advertise products/services and Influencers to monetize their reach. The platform features role-based access, campaign management, asynchronous reminders, and CSV exports, all wrapped in a performant Vue.js frontend and Flask backend.

---

## 🚀 Features

- **Role-Based Authentication & Authorization**: Separate flows for Admin, Sponsor, and Influencer roles using Flask-Security-Too (email/password & token-based) ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/app.py))
- **Sponsor Campaign Management**: Sponsors can create, activate/deactivate, and monitor ad campaigns
- **Influencer Engagement**: Influencers receive, accept, or reject ad requests and showcase their platform details
- **Admin Controls**: Admins can activate/deactivate sponsors, toggle feature flags, and delete users/campaigns
- **Real-Time Dashboard**: Cached with Redis to efficiently display running and pending campaigns ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/app.py))
- **Asynchronous Tasks**: Daily reminders and monthly reports powered by Celery with Redis broker/backend ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/celeryconfig.py))
- **CSV Export**: Generate and download campaign performance data via Flask-Excel
- **Email Notifications**: Integrated with MailHog for development/testing of SMTP-based emails ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/install_redis_mailhog.sh))

---

## 🛠️ Tech Stack

| Layer           | Technology                              |
|-----------------|-----------------------------------------|
| Frontend        | Vue.js                                  | ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2.git))
| Backend         | Flask, Flask-SQLAlchemy, Flask-Security | ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/app.py))
| Async & Caching | Celery, Redis                           | ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/celeryconfig.py))
| Database        | SQLite (development)                    |
| Email Testing   | MailHog                                 | ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/install_redis_mailhog.sh))
| Exports         | Flask-Excel                             |

---

## 📦 Prerequisites

- **Python** 3.8+ installed
- **Node.js** & **npm** (for Vue.js frontend dependencies)
- **Redis** server (cache & Celery broker) ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/install_redis_mailhog.sh))
- **MailHog** (SMTP testing) ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/install_redis_mailhog.sh))

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2.git
   cd Influencer-Engagement-Sponsorship-Coordination-Platform---V2
   ```

2. **Backend environment**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ``` ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/requirements.txt))

3. **Initialize Redis & MailHog**
   ```bash
   ./install_redis_mailhog.sh
   ```
   - Start Redis: `sudo service redis-server start`
   - Launch MailHog: `MailHog &`

4. **Initial Data**
   ```bash
   python create_initial_data.py
   ```
   This seeds admin, sample sponsor, influencer, and platform data.

5. **Run Services**
   - **Flask API**: `./run_flask.sh` (listens on port 7000) ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/run_flask.sh))
   - **Celery Worker**: `./run-celery.sh` ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/run-celery.sh))
   - **Celery Beat**: `./run-celery_beat.sh` ([github.com](https://github.com/21f1000520/Influencer-Engagement-Sponsorship-Coordination-Platform---V2/blob/main/run-celery_beat.sh))

6. **Frontend**
   - Navigate to `static/` folder
   - Install dependencies: `npm install`
   - Launch development server: `npm run serve`

---

## 📂 Directory Structure

```
├── app.py                   # Flask application factory
├── models.py                # Database models
├── entry_views.py           # Public API endpoints (auth, register)
├── admin_views.py           # Admin-specific endpoints
├── dashboard_views.py       # Campaign & request endpoints
├── tasks.py                 # Celery tasks (reminders, exports)
├── helper_functions.py      # Shared utilities
├── create_initial_data.py   # Seed script
├── requirements.txt         # Python dependencies
├── celeryconfig.py          # Celery broker/backend config
├── extentions.py            # Flask extensions (db, cache, security)
├── static/                  # Vue.js frontend source
│   ├── app.js
│   ├── styles.css
│   └── components/...
├── templates/               # Jinja2 templates
│   └── index.html
├── instance/                # SQLite database file
├── downloads/               # Generated CSV exports
└── scripts/                 # Helper shell scripts
```

---

## 🔗 API Endpoints (select)

- `POST /register` — Create user (role: infl or spons)
- `POST /user_login` — Authenticate, returns token & role
- `GET /users/<role>` — List users by role (admin/spons) [secured]
- `GET /send_ad_req_to_infl/<camp_id>/<infl_id>` — Sponsor sends request
- `GET /get_all_running` — Dashboard data (cached)
- `GET /start-export` & `GET /download-export/<task_id>` — CSV export flow

For a full list, refer to the view modules in the repository.

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch `git checkout -b feature/...`
3. Commit changes
4. Open a Pull Request

---

## 📫 Contact

For questions or feedback, reach out to the maintainer at **platform@iitm.ac.in**.

---

*Happy coding!*

