# English with Mr.Sam 🎓

**English with Mr.Sam** is an educational platform for learning English, where high-quality video lessons are combined with systematic testing and live mentorship. We help students not just watch lessons, but truly master the language at every level.

---

## 🌟 How It Works

Anyone can open the website and take the **first lesson of any level completely free** — to understand the learning format and get a feel for how the classes are conducted.

We currently offer **4 English levels** at launch:
- 🟢 **A1** — Beginner
- 🔵 **A2** — Elementary
- 🟡 **B1** — Intermediate
- 🔴 **B2** — Upper-Intermediate

Each level contains a specific number of lessons, and every single lesson is a complete learning cycle:
1. **🎬 1 Video Lesson** — core material for the topic.
2. **📝 15+ Tests** — exercises to reinforce grammar and vocabulary.
3. **✍️ Homework** — practical tasks for writing and comprehension.

---

## 👥 Mentorship System

We believe that feedback is essential for progress. That's why each level includes dedicated mentors.

### Who Are the Mentors?
Mentors are highly qualified English speakers who have achieved:
- **IELTS**: score of **7.0 or higher**
- **Multilevel Test**: **B2** level confirmed

### What Do Mentors Do?
Mentors have access to a dashboard where they can track each student's progress:
- ⏱️ **Video Watch Time** — how long a student watched the video lesson.
- ✅ **Test Analytics** — how many questions were answered correctly vs. incorrectly.
- 🤖 **Homework Review** — both **mentors and AI** check students' homework to ensure timely and accurate feedback.

Every week, mentors hold **live video calls** with students to discuss their progress, answer questions, and help them overcome any struggles in their learning.

---

## 🧠 Content Creation

All video lessons, materials, and course structures are created by **Mr. Sam** and the developer of the platform, **Azamat**. Their combined expertise ensures that every piece of content is engaging, structured, and academically effective.

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Python |
| **Database** | SQLite (Authentication + User Progress) |
| **AI Integration** | Coming soon |
| **Video Hosting** | YouTube (videos accessible via link only) |

---

## 🚀 Getting Started

### 🌐 Live Website
> The live website link will be available soon. In the meantime, you can run the project locally using the instructions below.

---

### 💻 Run Locally

If the live site is not yet available, you can run the project on your own computer.

#### Prerequisites
- Python 3.8 or higher
- VS Code (recommended) or any code editor
- Git

#### Step 1: Clone the Repository
```bash
git clone https://github.com/AaZzAaMmAaTt/English_with_Mr.Sam.git
cd English_with_Mr.Sam

Step 2: Run the Project
Option A — Using start_all.py (Easiest)

Run the startup script in terminal of the project:
python start_all.py

Then click **"Go Live"** in VS Code, or open your browser and go to:



Option B — Manual Start via PowerShell / Terminal

Open PowerShell (or terminal) and navigate to the project folder:
bash
cd English_with_Mr.Sam

Start the backend server:
bash
python backend\server.py --host 0.0.0.0 --port 8020

Open your browser and go to:
http://127.0.0.1:8020/
