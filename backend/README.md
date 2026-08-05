# MaramCraft - Premium Wood Craft E-Commerce Backend

MaramCraft is a high-end, production-ready e-commerce backend built with Python 3.13, Django 5.2, and Django REST Framework. It supports advanced relational design, customer accounts, catalog filtering, real-time inventory management, checkout logic with transactional integrity, review systems, and administrative control panels.

---

## Technical Stack

- **Framework**: Django 5.x, Django REST Framework
- **Database**: PostgreSQL
- **Security**: JWT Authentication (SimpleJWT), Django Password Validators, CORS-headers
- **Environment**: Python Dotenv
- **Media**: Pillow (image fields for category banners, product gallery, and user avatars)
- **Filtering**: Django Filter, REST Search, REST Ordering

---

## Folder Structure

```text
backend/
├── apps/
│   ├── accounts/       # Custom user model & JWT authentication flows
│   ├── categories/     # Product categorizations & slugs
│   ├── products/       # Products catalog & multi-image gallery
│   ├── cart/           # Shopping cart operations & stock validations
│   ├── wishlist/       # Saved product collections
│   ├── orders/         # Customer addresses, checkout flows, order numbers
│   ├── payments/       # Transaction tracking & mock gateway (Stripe/Razorpay)
│   ├── reviews/        # Feedback with verified-purchase metrics
│   ├── coupons/        # Promotional discounts and validity verification
│   └── common/         # API responses formatting & exceptions handling
│
├── config/             # Django root configurations (settings, urls, wsgi)
├── media/              # User-uploaded profile photos and products
├── static/             # Static administrative files
├── requirements.txt    # Application package dependencies
├── .env.example        # Environment variables structure
└── manage.py           # Management entrypoint
```

---

## Installation & Setup Guide

### 1. Prerequisites
Ensure you have **Python 3.13+** and **PostgreSQL** installed and running on your local machine.

### 2. Database Setup
Create a PostgreSQL database named `maramcraft_db`:
```sql
CREATE DATABASE maramcraft_db;
```

### 3. Environment Configurations
Clone the `.env.example` file and create a `.env` file:
```bash
cp .env.example .env
```
Fill in the database user and password. For example:
```env
SECRET_KEY=your-secure-random-key
DEBUG=True

DB_NAME=maramcraft_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### 4. Virtual Environment & Dependencies
Create and activate a python virtual environment, then install requirements:
```bash
python -m venv venv
venv\Scripts\activate   # On Windows
source venv/bin/activate # On Unix/macOS

pip install -r requirements.txt
```

### 5. Run Database Migrations
Generate database tables for all modules:
```bash
python manage.py migrate
```

### 6. Create Admin / Superuser
To create an administrative account, run:
```bash
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@maramcraft.com', 'admin1234', first_name='Admin', last_name='User')"
```
*Note: This creates an admin panel access with email `admin@maramcraft.com` and password `admin1234`.*

### 7. Run Server
Start the local development server:
```bash
python manage.py runserver
```
The API is available at: `http://127.0.0.1:8000/`

---

## Running the Unit Tests

The backend includes comprehensive testing for users authentication and product filtering. Run the suite using:
```bash
python manage.py test
```

---

## API Response Format

All responses conform to a unified structure.

### Successful Response Example:
```json
{
    "success": true,
    "message": "Data retrieved successfully.",
    "data": {
        "results": [...]
    }
}
```

### Error Response Example:
```json
{
    "success": false,
    "message": "Validation failed.",
    "data": {
        "email": [
            "User with this email already exists."
        ]
    }
}
```

---

## API Endpoints Reference

### Authentication (`/api/auth/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register/` | Self-register a new account | None | `email`, `password`, `password_confirm`, `first_name`, `last_name`, `phone` |
| **POST** | `/login/` | Obtain access and refresh tokens | None | `email`, `password` |
| **POST** | `/token/refresh/` | Refresh expired access token | None | `refresh` |
| **POST** | `/logout/` | Blacklists refresh token | Token | `refresh` |
| **GET** | `/profile/` | Fetch profile details | Token | None |
| **PUT** | `/profile/` | Update profile information | Token | `first_name`, `last_name`, `phone`, `profile_image` |
| **POST** | `/change-password/` | Modify user password | Token | `old_password`, `new_password`, `new_password_confirm` |
| **POST** | `/forgot-password/` | Request token for password reset | None | `email` |
| **POST** | `/reset-password/` | Complete reset with token | None | `uidb64`, `token`, `new_password`, `new_password_confirm` |

### Categories (`/api/categories/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | List all active categories | None | None |
| **POST** | `/` | Create category | Admin | `name`, `description`, `image`, `is_active` |
| **GET** | `/<slug>/` | Get category details | None | None |
| **PUT/PATCH** | `/<slug>/` | Update category details | Admin | `name`, `description`, `image`, `is_active` |
| **DELETE** | `/<slug>/` | Delete a category | Admin | None |

### Products (`/api/products/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | List active products (supports searching, ordering, filtering) | None | Query parameters: `search`, `ordering`, `category_slug`, `min_price`, `max_price` |
| **POST** | `/` | Create a product with multi-image gallery | Admin | Form-data: `category`, `name`, `price`, `quantity`, `thumbnail`, `uploaded_images` (multiple) |
| **GET** | `/<slug>/` | Retrieve specific product details | None | None |
| **PUT/PATCH** | `/<slug>/` | Update product details or add gallery photos | Admin | Form-data |
| **DELETE** | `/<slug>/` | Delete product | Admin | None |

### Shopping Cart (`/api/cart/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | View cart contents, totals, count | Token | None |
| **POST** | `/add/` | Add product to cart (verifies stock) | Token | `product_id`, `quantity` |
| **PUT/PATCH**| `/update/<item_id>/` | Modify item quantity | Token | `quantity` |
| **DELETE** | `/remove/<item_id>/` | Remove item | Token | None |
| **DELETE** | `/clear/` | Wipe cart clean | Token | None |

### Wishlist (`/api/wishlist/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | List saved wishlist products | Token | None |
| **POST** | `/` | Save product to wishlist | Token | `product_id` |
| **DELETE** | `/<wishlist_id>/` | Remove entry from wishlist | Token | None |
| **DELETE** | `/remove-product/<product_id>/` | Toggle/remove product directly | Token | None |

### Shipping Addresses (`/api/orders/addresses/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | List saved delivery addresses | Token | None |
| **POST** | `/` | Create address (auto-deactivates other defaults if set) | Token | `name`, `phone`, `address`, `city`, `state`, `zipcode`, `default` |
| **PUT/PATCH** | `/<id>/` | Update address info | Token | `name`, `phone`, `address`, `city`, `state`, `zipcode`, `default` |
| **DELETE** | `/<id>/` | Remove address | Token | None |

### Orders (`/api/orders/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | List order history | Token | None |
| **POST** | `/` | Place order from cart (locks stock, clears cart) | Token | `address_id`, `coupon_code` (optional), `payment_method` |
| **GET** | `/<id>/` | Get detailed receipt | Token | None |
| **POST** | `/<id>/cancel/` | Cancel pending order (restores inventory stock) | Token | None |

### Coupons (`/api/coupons/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | List coupons | Admin | None |
| **POST** | `/validate/` | Validate coupon against order total | Token | `code`, `order_total` |

### Payments (`/api/payments/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/confirm/` | Confirm payment success/fail (simulates stripe/razorpay callback) | Token | `order_id`, `payment_status` ('Completed'/'Failed'), `transaction_id` (optional) |
| **GET** | `/<order_id>/status/` | Inspect payment logs | Token | None |

### Product Reviews (`/api/reviews/`)
| Method | Endpoint | Description | Auth Required | Request Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/?product=<id>`| Read reviews for a specific product | None | None |
| **POST** | `/` | Add feedback (checks verified purchase, restricts duplicate) | Token | `product`, `rating` (1-5), `comment` |
