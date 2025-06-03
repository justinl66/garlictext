# GarlicText
### A stupid game for stupid people

## Project Overview
GarlicText is a multiplayer game where players draw images, enhance them with AI, and caption them. The project consists of:
- Frontend (React with TypeScript)
- Database Backend (Node.js with PostgreSQL)
- Python Backend (AI image enhancement)

## Setup for Development

### Frontend Setup:
```
cd frontend
npm install
npm run dev
```

### Database Backend Setup:
1. Install PostgreSQL if you haven't already
2. Set up the database:
```
cd database_backend
# On Windows:
setup_db.bat
# On Unix/Mac:
./setup_db.sh
```
3. Install dependencies and start the server:
```
npm install
npm run dev
```

### Python Backend Setup:
```
cd python_backend
pip install -r requirements.txt
python api_server.py
```

## Docker Setup (All Components)

To run the entire application using Docker:
```
docker-compose up --build
```

This will start all services:
- Frontend: Available at http://localhost:5173
- Database Backend: Available at http://localhost:5001
- Python Backend: Available at http://localhost:8000
- PostgreSQL Database: Available at localhost:5432

## Architecture

### Database Schema
The PostgreSQL database includes tables for:
- Users - Player information and authentication
- Games - Game sessions and settings
- Game Rounds - Individual rounds within a game
- Images - User-generated drawings and AI-enhanced versions
- Captions - User-submitted captions for images

### API Integration
The database backend exposes RESTful endpoints for the frontend to:
- Create and join games
- Save drawings and captions
- Handle voting and game progression
- Track user scores and statistics

For more detailed information about each component, see the README files in their respective directories.

### Below is Grading info (remove later)
Grading
Project grading will consist of the following components. All percentages below are percentages of the total project grade.

Group project components (one per group):

 3% – 1- to 2-page project proposals.
 3% – 1- to 2-page initial schedule and project plan. This should specify at least one (preferably two) intermediate milestones for the project. The point of the milestones is to have running code early, that implements some project features and can be demonstrated. For an example, see Lucy Deckard’s “Developing timelines and milestone charts for your proposal” although we don’t expect anything that fancy. Plus, we don’t expect the plan to be perfect! It’s just a plan, and will no doubt be adjusted as the project evolves.
 4% – App can display dynamic data to the user.
 4% – App can upload data from the client to the back-end.
 4% – User can meaningfully search through server data.
21% – Three more distinct features. Points will be given according to how creative and useful the features are.
 8% – Meaningful understanding of Git is exemplified through version control.
 5% – Detailed README file that accurately and completely describes how to run the app locally.
 5% – Project is generally visually pleasing and easy to navigate.
14% – Project presentations and demos (see Resources for advice about presentations).
Status reports (one set of reports per student):

10% – Five weekly status reports. Each report should summarize what you did that week. Reports should be about half a page, and no more than one page.
Reports will start the week after the initial plan is due.
Each report is due on Friday.
The last report is due the week before the final report is due.
For more, see Work involved.
Final report (one per student):

 3% – Project description and overview is an accurate account of the project submitted.
10% – Report details individual contribution in a meaningful way, which can be verified by git history, and describes how the contribution interacts with the contributions of the rest of the group.
 3% – Thoughtful reflections of difficulties faced, along with descriptions of how you overcame them.
 3% – Discussion of improvements/things you would have done differently and additional features you would have liked to implement.
Submission
To let us know about your groups, please fill out this Google Form. Only one group member must submit. It's due at the same time as the proposal; for more, see Work involved.

Groups should have 3–5 members. We may allow exceptions on a case-by-case basis if you absolutely cannot find another group. Solo groups are discouraged since a large part of software construction is collaborative work.
We will only consider exceptions a week before the proposal is due. Do not email requesting an exception until then.
It's fine if members are in different sections, however:
Choose the discussion in which most members are enrolled.
If there is no majority, feel free to choose one of the discussions that a member is enrolled.
However, make sure that every member can make it to the discussion you choose. (At least, make sure all can make it to the last discussion: Friday, tenth week.) If this is not possible, you must choose a different group.
We'll be using Gradescope to submit your project deliverables. For the project proposal and initial schedule/plan, please use the groups feature in Gradescope. Only one group member has to submit; this member adds the rest of the group. Make sure that your group is the same that was submitted to the Google Form.

Present your project in the last discussion (Friday, tenth week). You may present however you'd like (slides, demo, etc.), but you're limited to five minutes per group. This is a strict requirement; you will be cut off. There are no exact specifics to cover in the presentation, but try to cover some of the following:

the problem you're trying to solve,
your general solution to the problem,
a quick description of your tech stack,
a couple screenshots (or if time allots, a quick demo) of your solution, and
potential future work.
All group members must present. If you plan on presenting a slideshow, please do submit your slides to Gradescope before your presentation (also using the groups feature).

We'll be using Gradescope to submit a compressed tarball of your Git repository. This should contain all your group’s work, including any documentation, etc. The repository should not include generated files, only source code; the README file should explain how to generate any files (e.g., node modules) buildable from the source. Make sure to also include an environment file (typically named .env) if necessary. While this file should not be committed, it should be part of your tarball (so we can deploy your project locally).

In addition, each group member must submit weekly status reports and a final report to Gradescope individually. Ensure that your report is in PDF format.