# IT110 Final Project: Capy & Co

> **Course:** IT110 - Web Systems and Technologies 
> **Objective:** A dynamic Single Page Application (SPA) that transforms raw public API data into a curated, visual narrative.

## About The Project


Users can not only explore this data but also register to create their own "chapter" by saving favorites, adding notes, or creating collections—blending external data with personal user input.

### Key Features
* **Visual Storytelling:** Data from an external API presented via a modern, marketing-style interface.
* **Authentication:** Secure user registration and login (Laravel Breeze).
* **User Personalization (CRUD):** Authenticated users can Create, Read, Update, and Delete their own related content (e.g., "Favorite Planets" or "Art Notes") stored in our local SQL database.
* **Seamless Interactivity:** Built as a SPA using Inertia.js, meaning no full page reloads.
* **Modern UI/UX:** Responsive design utilizing Aceternity UI/Tailwind and Framer Motion for animations.

---

## Tech Stack

**Backend**
* **Laravel (PHP)**: Core backend framework.
* **MySQL**: Relational database for user data and CRUD operations.

**Frontend**
* **React**: JavaScript library for UI.
* **Tailwind CSS**: Utility-first styling.
* **Inertia.js**: The bridge connecting Laravel and React.
* **Framer Motion**: For micro-interactions and animations.

---

## Installation Guide (For Team Members)

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

**Terminal 2 (Frontend Compiler)**
```bash
npm run ev
```
