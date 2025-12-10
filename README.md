# 🚀 IT110 Final Project: Capy & Co

> **Course:** IT110 - Modern Dynamic Web Pages  
> **Objective:** A dynamic Single Page Application (SPA) that transforms raw public API data into a curated, visual narrative.

## 📖 About The Project


Users can not only explore this data but also register to create their own "chapter" by saving favorites, adding notes, or creating collections—blending external data with personal user input.

### 🌟 Key Features
* [cite_start]**Visual Storytelling:** Data from an external API presented via a modern, marketing-style interface[cite: 13, 15].
* [cite_start]**Authentication:** Secure user registration and login (Laravel Breeze)[cite: 94].
* [cite_start]**User Personalization (CRUD):** Authenticated users can Create, Read, Update, and Delete their own related content (e.g., "Favorite Planets" or "Art Notes") stored in our local SQL database[cite: 69, 70].
* [cite_start]**Seamless Interactivity:** Built as a SPA using Inertia.js, meaning no full page reloads[cite: 113].
* [cite_start]**Modern UI/UX:** Responsive design utilizing Aceternity UI/Tailwind and Framer Motion for animations[cite: 55, 56].

---

## 🛠️ Tech Stack

**Backend**
* [cite_start]![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white) **Laravel (PHP)**: Core backend framework[cite: 52].
* [cite_start]**MySQL**: Relational database for user data and CRUD operations[cite: 54].

**Frontend**
* [cite_start]![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **React**: JavaScript library for UI[cite: 53].
* [cite_start]![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **Tailwind CSS**: Utility-first styling[cite: 55].
* [cite_start]**Inertia.js**: The bridge connecting Laravel and React[cite: 54].
* [cite_start]**Framer Motion**: For micro-interactions and animations[cite: 56].

---

## ⚙️ Installation Guide (For Team Members)

Follow these steps exactly to set up the project on your local machine.

### Prerequisites
* **XAMPP** (Ensure MySQL and Apache are running)
* **Node.js** & **NPM** installed
* **Composer** installed
* **Git** installed

### Step-by-Step Setup

1.  **Clone the Repository**
    ```bash
    git clone <INSERT_REPO_LINK_HERE>
    cd repo-name
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend (PHP) packages
    composer install

    # Install Frontend (JS) packages
    npm install
    ```

3.  **Setup the Database**
    * Open XAMPP and go to `http://localhost/phpmyadmin`.
    * Create a new database named: `recipe_db`.

4.  **Configure Environment**
    * Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    * Open `.env` and verify your database settings:
        ```env
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=recipe_db
        DB_USERNAME=root
        DB_PASSWORD=
        ```

5.  **Finish Setup**
    ```bash
    # Generate App Key
    php artisan key:generate

    # Run Database Migrations (Creates tables)
    php artisan migrate
    ```

---

## 💻 Running the Application

To develop, you must have **two** terminals running simultaneously:

**Terminal 1 (Backend Server)**
```bash
php artisan serve
```

**Terminal 1 (Frontend Compiler)**
```bash
npm run ev
```