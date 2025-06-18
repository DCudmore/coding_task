# Item Management Application

This is a full-stack web application for managing items, built with a Django REST Framework backend and a React (Vite, Chakra UI v3, React Query) frontend. It provides basic CRUD (Create, Read, Update, Delete) functionalities for items.

## 🚀 Setup Instructions

Follow these steps to get the application running on your local machine.

### Prerequisites

* **Python 3.8+** (for the Django backend)
* **Node.js 18+** and **npm** (for the React frontend)

### Backend Setup (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Create a superuser (optional, for Django Admin access):**
    ```bash
    python manage.py createsuperuser
    ```

6.  **Start the Django development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be accessible at `http://127.0.0.1:8000/api/items/`. If the server runs on a different port, you'll need to update the frontend .env file accordingly.

### Frontend Setup (React with Vite)

1.  **Open a new terminal window** (keep the backend terminal running).

2.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

3.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

4.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```
    The frontend application should open in your browser at `http://localhost:5173/`. If it is a different URL, you'll need to update the backend .env file accordingly.

## 🔒 Security Considerations (Development vs. Production)

**Important Note for Deployment:**
For ease of setup in this development environment, the `.env` files for both the frontend and backend **have been included in the repository**. Of course I wouldn't do this in a real production repo.

## 🧠 Assumptions

* **Uniqueness on Duplicates:** Currently, `name` and `group` fields, as defined in the Django `Item` model, are **case-sensitive** by default if a `unique=True` constraint is applied at the model level. This means "Item A" and "item a" would be considered distinct.

* **API Endpoints:** The application assumes standard RESTful endpoints for `/api/items/` (list/create) and `/api/items/<id>/` (retrieve/update/delete) as provided by Django REST Framework's `ModelViewSet`.

## ✨ Things I Would Do Next

If I were to continue developing this application, here are key enhancements I would implement:

* **Move New Item Box to an Overlay (Modal):**

    * **Description:** Currently, clicking "Add New Item" hides the item list and displays the form. A better UX would be to present the form in a modal (popup) window that overlays the existing list, allowing the user to stay in context.

* **Implement Text Filtering / Search:**

    * **Description:** Add an input field to the item list that allows users to type and filter items by their `name`. This would involve sending the search input along with the `GET` request to the backend.

* **Authentication and Authorization:**

    * **Description:** For a real-world application, users would need to log in, and actions (like creating, editing, or deleting items) would be restricted based on their authentication status and permissions (e.g., only logged-in users can add items; users can only edit their own items).

    * **Implementation:** Integrate a Django authentication system and add context providers/hooks on the frontend to manage user state. Authentication would be validated on both the client and backend whenever API requests are sent.

* **Better Error Messages from Backend Using Custom Serializer Validation:**

    * **Description:** While Django REST Framework provides default error messages, they can sometimes be generic or less user-friendly. For specific scenarios, custom messages improve the user experience.

    * **Example:**

        * **Empty Group on POST:** Currently, if the `group` field (which uses choices/enum) receives an empty string on a `POST` request, the backend might return `{"group": ["\"\" is not a valid choice."]}`. A custom serializer could change this to something more direct like "Please select a valid group for the item."
