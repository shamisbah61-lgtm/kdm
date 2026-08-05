import requests

login_url = "http://127.0.0.1:8000/api/auth/login/"
cart_url = "http://127.0.0.1:8000/api/cart/"
add_cart_url = "http://127.0.0.1:8000/api/cart/add/"
addresses_url = "http://127.0.0.1:8000/api/orders/addresses/"
orders_url = "http://127.0.0.1:8000/api/orders/"

# 1. Login
session = requests.Session()
login_res = session.post(login_url, json={
    "email": "admin@maramcraft.com",
    "password": "admin1234"
})
print("Login Status:", login_res.status_code)
if login_res.status_code != 200:
    print(login_res.text)
    exit()

tokens = login_res.json().get("data", {}).get("tokens", {})
access_token = tokens.get("access")
headers = {
    "Authorization": f"Bearer {access_token}"
}

# 2. Add to cart
add_res = session.post(add_cart_url, json={
    "product_id": 30,
    "quantity": 1
}, headers=headers)
print("Add Cart Status:", add_res.status_code)
if add_res.status_code != 200:
    print(add_res.text)

# 3. Get Address
addr_res = session.get(addresses_url, headers=headers)
res_json = addr_res.json()
addresses = res_json.get("data", {}).get("results", [])

if not addresses:
    # Create address
    create_addr_res = session.post(addresses_url, json={
        "name": "John Doe",
        "phone": "1234567890",
        "address": "123 Luxury Way",
        "city": "Distill Town",
        "state": "CA",
        "zipcode": "90210",
        "country": "United States"
    }, headers=headers)
    print("Create Address Status:", create_addr_res.status_code)
    addr = create_addr_res.json().get("data", create_addr_res.json())
else:
    addr = addresses[0]

print("Selected Address:", addr)

# 4. Place Order
order_payload = {
    "address_id": addr["id"],
    "payment_method": "stripe",
    "coupon_code": None
}
order_res = session.post(orders_url, json=order_payload, headers=headers)
print("Order Placed Status:", order_res.status_code)
if order_res.status_code >= 400:
    print(order_res.text[:4000])
else:
    print(order_res.json())
