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
    (You might need to create a `requirements.txt` if you don't have one, by running `pip freeze > requirements.txt`)
    ```bash
    pip install -r requirements.txt
    # If no requirements.txt exists, install necessary packages:
    # pip install django djangorestframework django-cors-headers django-filter
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
    The backend API will be accessible at `http://127.0.0.1:8000/api/items/`.

### Frontend Setup (React with Vite)

1.  **Open a new terminal window** (keep the backend terminal running).

2.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

3.  **Install Node.js dependencies:**
    ```bash
    npm install
    # This will install react, react-dom, @chakra-ui/react, @tanstack/react-query,
    # react-hook-form, zod, @hookform/resolvers/zod, react-icons, etc.
    ```

4.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```
    The frontend application will typically open in your browser at `http://localhost:5173/`.

## 🧠 Assumptions

* **Database Schema:** It's assumed that the `Item` model in Django has fields like `name` (CharField) and `group` (CharField, possibly with choices), along with automatic `id`, `created_at`, and `updated_at` fields.

* **Uniqueness on Duplicates:** Currently, `name` and `group` fields, as defined in the Django `Item` model, are **case-sensitive** by default if a `unique=True` constraint is applied at the model level. This means "Item A" and "item a" would be considered distinct. DRF serializers will enforce this constraint.

* **API Endpoints:** The application assumes standard RESTful endpoints for `/api/items/` (list/create) and `/api/items/<id>/` (retrieve/update/delete) as provided by Django REST Framework's `ModelViewSet`.

* **Frontend-Backend Communication:** CORS (Cross-Origin Resource Sharing) headers are configured on the Django backend using `django-cors-headers` to allow communication from the frontend's origin (`http://localhost:5173`).

## ✨ Things I Would Do Next

If I were to continue developing this application, here are key enhancements I would implement:

* **Move New Item Box to an Overlay (Modal):**

    * **Description:** Currently, clicking "Add New Item" hides the item list and displays the form. A better UX would be to present the form in a modal (popup) window that overlays the existing list, allowing the user to stay in context.

    * **Implementation:** Use Chakra UI's `Modal` component (e.g., `Modal.Root`, `Modal.Content`, `Modal.Header`, `Modal.Body`, `Modal.Footer`) to wrap the `ItemForm`.

* **Implement Text Filtering / Search:**

    * **Description:** Add an input field to the item list that allows users to type and filter items by their `name`. This would involve sending the search input along with the `GET` request to the backend.

    * **Implementation:**

        * **Frontend:** Add an `Input` component in `App.tsx` or `ItemTable.tsx`. Implement a debouncing mechanism (e.g., using `useEffect` with a `setTimeout`) to prevent excessive API calls on every keystroke. Pass the debounced search text as a query parameter (`?search=...`) to the `useItems` React Query hook.

        * **Backend:** Integrate `rest_framework.filters.SearchFilter` into the `ItemViewSet` and specify `search_fields = ['name']` to allow the backend to handle the filtering efficiently.

* **Authentication and Authorization:**

    * **Description:** For a real-world application, users would need to log in, and actions (like creating, editing, or deleting items) would be restricted based on their authentication status and permissions (e.g., only logged-in users can add items; users can only edit their own items).

    * **Implementation:** Integrate a Django authentication system (e.g., `djoser` for token-based auth) and add context providers/hooks on the frontend to manage user state.

* **Better Error Messages from Backend Using Custom Serializer Validation:**

    * **Description:** While Django REST Framework provides default error messages, they can sometimes be generic or less user-friendly. For specific scenarios, custom messages improve the user experience.

    * **Examples:**

        * **Duplicate Names:** If the `name` field on the Django `Item` model is marked `unique=True`, submitting a duplicate will result in a backend error. A custom serializer validation could provide a more specific message like "An item with this name already exists. Please choose a different name."

        * **Empty Group on POST:** Currently, if the `group` field (which uses choices/enum) receives an empty string on a `POST` request, the backend might return `{"group": ["\"\" is not a valid choice."]}`. A custom serializer could change this to something more direct like "Please select a valid group for the item."

    * **Implementation:** In `backend/items/serializers.py`, you can add `validate_field_name` methods or an overall `validate` method within your `ItemSerializer` to implement custom logic and throw `serializers.ValidationError` with specific messages. This allows for more granular control over error responses for both unique constraints and choice field issues.