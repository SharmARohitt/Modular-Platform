# 🎓 Modular Learning Platform

> **Live Demo**: [Click to Explore the Platform](#) *(Deploy URL here)*  
> A full-stack, modular LMS crafted for a rich, structured, and interactive e-learning experience.

EduNest empowers administrators to build deeply nested course content and allows learners to progress through a dynamic, question-driven journey – simulating the core functionalities of platforms like Coursera or Udemy.

---

## 🚀 Project Overview

- 🛠️ **Built From Scratch**: Demonstrates the architecture of a scalable LMS.
- 📂 **Nested Data Models**: Courses → Sections → Units → Chapters.
- 🔐 **Role-Based Access**: Admin and Learner separation with protected routes.
- 📱 **Optional Mobile App**: Seamless learner experience with Flutter.
- ⏱️ **Development Time**: ~3-4 days.

---

## ✨ Features

<details>
  <summary><strong>🔐 Authentication & Authorization</strong></summary>

- Secure JWT-based login & registration.
- Role-based route & feature access: `Admin`, `Learner`.
- Input sanitization and robust validation.
- Encrypted passwords using `bcrypt`.

</details>

<details>
  <summary><strong>🎓 Course Management & Admin Panel</strong></summary>

- Fully dynamic, deeply nested structure:
  - `Course` → `Section` → `Unit` → `Chapter`.
- Rich content per chapter:
  - ✅ Multiple Choice
  - ✍️ Fill in the Blank
  - 📝 Text Response
  - 🎙️ Audio Answer *(Bonus Feature)*
- Admin privileges:
  - Create, edit, and reorganize course structures.

</details>

## 👨‍🏫 Try It Yourself – Demo Credentials

You can **log in and explore** the platform using the following sample accounts seeded by default:

### 🛠️ Admin Account
- **Email:** `admin@modularlearn.com`  
- **Password:** `password123`

### 🎓 Learner Account
- **Email:** `learner@modularlearn.com`  
- **Password:** `password123`

---

## 🧭 How to Use the Platform (Demo Guide)

> 🔐 These accounts are preloaded to help you explore the platform quickly.

1. **Login**  
   Go to the login page and use the credentials above.

2. **Explore as an Admin**
   - Access the admin dashboard.
   - Create or manage courses with nested content:
     - Course → Section → Unit → Chapter
   - Add chapter content using:
     - ✅ Multiple Choice
     - ✍️ Fill in the Blank
     - 📝 Text Response
     - 🎙️ Audio Answer (optional)
   - Organize the learning structure visually and interactively.

3. **Explore as a Learner**
   - View assigned courses in your learner dashboard.
   - Resume learning from where you left off.
   - Attempt interactive chapter questions.
   - Track your performance and progress per chapter.

> 🧪 This walkthrough is ideal for testing, learning the structure, and understanding both content creation and learner journeys.

---

> ⚠️ **Important:** These demo credentials are meant for development or preview use only. Always replace or secure these accounts before deploying to production.


<details>
  <summary><strong>📚 Learner Dashboard</strong></summary>

- Personalized course dashboard with progress memory.
- Resume from last learned chapter.
- Attempt chapter-level questions.
- Get instant performance summaries.

</details>

<details>
  <summary><strong>⚙️ Backend Architecture</strong></summary>

- Built with **Node.js + Express + MongoDB**.
- REST APIs for:
  - Users, Courses, Sections, Units, Chapters, Questions, Progress.
- Clean nested population with `Mongoose`.
- Password hashing & validation.
- Strong error handling and schema validation.

</details>

<details>
  <summary><strong>🖥 Frontend (Next.js)</strong></summary>

- Built with **Next.js**, **React**, and **TailwindCSS**.
- SSR/SSG for SEO-ready public pages.
- Role-based dynamic routing.
- Nested UI structure using accordions/tree views.
- Global state via `React Context`.

</details>

<details>
  <summary><strong>📱 Optional Mobile App (Flutter)</strong></summary>

- Cross-platform mobile interface for learners.
- Core features:
  - Login
  - Course Exploration
  - Chapter Navigation
  - Question Attempting
- Real-time API sync for tracking progress.

</details>

---

## 🧩 Tech Stack

| Layer         | Technologies                                |
|---------------|---------------------------------------------|
| Frontend      | Next.js, React, TailwindCSS                 |
| Backend       | Node.js, Express.js                         |
| Database      | MongoDB, Mongoose                           |
| Authentication| JWT, bcrypt                                 |
| Mobile (Opt)  | Flutter                                     |

---

## 🧪 Setup Instructions

### 📥 Clone Repository

```bash
git clone https://github.com/your-username/edunest.git
cd edunest
