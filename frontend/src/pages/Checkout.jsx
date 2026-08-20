import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Landmark, CreditCard, CheckCircle2, ChevronRight, Plus, Lock, X, Edit } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, fetchCart, totalPrice } = useContext(CartContext);
  const coupon = location.state?.coupon || null;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  
  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressData, setAddressData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    default: true,
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('input'); // 'input', 'processing', 'success', 'failed'
  const [processingMsg, setProcessingMsg] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  
  // Stripe form fields
  const [cardFields, setCardFields] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  
  // Razorpay fields
  const [upiId, setUpiId] = useState('');
  const [selectedRazorOption, setSelectedRazorOption] = useState('upi'); // 'upi', 'netbanking'

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!createdOrder) return;
    
    setPaymentStep('processing');
    setPaymentError('');
    
    setProcessingMsg('Connecting to secure gateway...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProcessingMsg('Verifying card authentication...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setProcessingMsg('Finalizing transaction authorization...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const paymentRes = await apiRequest('/payments/confirm/', {
      method: 'POST',
      body: {
        order_id: createdOrder.id,
        payment_status: 'Completed',
      },
    });

    if (paymentRes.success) {
      setProcessingMsg('Payment authorized successfully!');
      setPaymentStep('success');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const finalizedOrder = {
        ...createdOrder,
        payment_status: 'Paid',
        status: 'Confirmed'
      };
      
      setOrderSuccess(finalizedOrder);
      setShowPaymentModal(false);
      fetchCart();
    } else {
      setPaymentError(paymentRes.message || 'Payment authentication failed. Please check card credentials.');
      setPaymentStep('failed');
    }
  };

  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const res = await apiRequest('/orders/addresses/');
    if (res.success) {
      const addrList = res.data.results || res.data || [];
      setAddresses(addrList);
      // Auto-select default address
      const defaultAddr = addrList.find(addr => addr.default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (addrList.length > 0) {
        setSelectedAddressId(addrList[0].id);
      }
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editingAddressId ? `/orders/addresses/${editingAddressId}/` : '/orders/addresses/';
    const method = editingAddressId ? 'PATCH' : 'POST';
    
    const res = await apiRequest(endpoint, {
      method: method,
      body: addressData,
    });
    
    if (res.success) {
      await fetchAddresses();
      setSelectedAddressId(res.data.id || editingAddressId);
      setShowAddressForm(false);
      setEditingAddressId(null);
      // Reset form
      setAddressData({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipcode: '',
        default: true,
      });
    } else {
      alert(res.message || 'Failed to save address.');
    }
  };

  const handleRazorpayPayment = async (order) => {
    // 1. Create order in backend
    const res = await apiRequest('/payments/create-razorpay-order/', {
      method: 'POST',
      body: { order_id: order.id }
    });

    if (!res.success) {
      alert(res.message || 'Failed to initialize Razorpay checkout.');
      setPlacingOrder(false);
      return;
    }

    const { razorpay_order_id, amount, currency } = res.data;
    const key_id = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: key_id,
      amount: amount.toString(),
      currency: currency,
      name: "MaramCraft",
      description: `Payment for Order #${order.order_number}`,
      order_id: razorpay_order_id,
      handler: async function (response) {
        // 3. Verify Payment
        const verifyRes = await apiRequest('/payments/verify-razorpay-payment/', {
          method: 'POST',
          body: {
            order_id: order.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }
        });

        if (verifyRes.success) {
          const finalizedOrder = {
            ...order,
            payment_status: 'Paid',
            status: 'Confirmed'
          };
          setOrderSuccess(finalizedOrder);
          fetchCart();
        } else {
          alert('Payment verification failed.');
        }
      },
      prefill: {
        name: "Customer", // Can be dynamically filled based on user profile
      },
      theme: {
        color: "#d32f2f" // MaramCraft Red
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
      alert(`Payment Failed: ${response.error.description}`);
    });
    rzp.open();
    
    setPlacingOrder(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address.');
      return;
    }
    setPlacingOrder(true);
    
    // If an order was already created in the backend (but payment failed or was closed), 
    // retry the payment for the existing order instead of creating a new one.
    if (createdOrder) {
      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment(createdOrder);
      } else {
        setShowPaymentModal(true);
        setPlacingOrder(false);
      }
      return;
    }

    // 1. Create order
    const orderRes = await apiRequest('/orders/', {
      method: 'POST',
      body: {
        address_id: selectedAddressId,
        coupon_code: coupon ? coupon.code : null,
        payment_method: paymentMethod,
      },
    });

    if (orderRes.success) {
      const order = orderRes.data;
      
      // 2. Handle Payment Flow
      if (paymentMethod === 'cod') {
        setOrderSuccess(order);
        fetchCart(); // sync navbar badge
        setPlacingOrder(false);
      } else if (paymentMethod === 'razorpay') {
        setCreatedOrder(order);
        handleRazorpayPayment(order);
      } else {
        // Stripe -> Open Mock Payment Gateway Modal
        setCreatedOrder(order);
        setCardFields({ number: '', expiry: '', cvc: '', name: '' });
        setUpiId('');
        setSelectedRazorOption('upi');
        setPaymentStep('input');
        setPaymentError('');
        setShowPaymentModal(true);
        setPlacingOrder(false);
      }
    } else {
      alert(orderRes.message || 'Failed to place order.');
      setPlacingOrder(false);
    }
  };

  const calculateFinalAmount = () => {
    const sub = parseFloat(totalPrice) || 0;
    const disc = coupon ? parseFloat(coupon.discount) || 0 : 0;
    return Math.max(0, sub - disc).toFixed(2);
  };



  if (orderSuccess) {
    return (
      <div className="container success-container animate-fade-in">
        <CheckCircle2 size={64} className="success-icon" />
        <h1>Order Placed Successfully!</h1>
        <p className="success-order-num">Order Number: <b>{orderSuccess.order_number}</b></p>
        <p className="success-msg">
          Thank you for choosing MaramCraft. Your automotive accessories are confirmed and we are preparing them for shipment.
        </p>
        <div className="success-actions">

          <Link to="/profile" className="btn btn-secondary">
            View Order History
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-layout">
        {/* Left Column: Shipping & Payment */}
        <div className="checkout-details-col">
          {/* Shipping Section */}
          <section className="checkout-section-card">
            <div className="section-title-row">
              <h2>1. Shipping Address</h2>
              {!showAddressForm && (
                <button className="btn-add-new-addr" onClick={() => {
                  setEditingAddressId(null);
                  setAddressData({
                    name: '', phone: '', address: '', city: '', state: '', zipcode: '', default: true
                  });
                  setShowAddressForm(true);
                }}>
                  <Plus size={14} /> New Address
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddressSubmit} className="new-address-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressData.name}
                      onChange={(e) => setAddressData({ ...addressData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressData.phone}
                      onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressData.address}
                    onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group-row-triple">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressData.city}
                      onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressData.state}
                      onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zipcode</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressData.zipcode}
                      onChange={(e) => setAddressData({ ...addressData, zipcode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions-addr">
                  <button type="submit" className="btn btn-primary" style={{ color: '#000' }}>Save Address</button>
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                    setAddressData({
                      name: '', phone: '', address: '', city: '', state: '', zipcode: '', default: true
                    });
                  }}>Cancel</button>
                </div>
              </form>
            ) : addresses.length === 0 ? (
              <div className="no-address-state">
                <p>No shipping addresses found.</p>
                <button className="btn btn-secondary" onClick={() => setShowAddressForm(true)}>
                  Create Address
                </button>
              </div>
            ) : (
              <div className="address-selector-list">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`address-option-label ${selectedAddressId === addr.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div className="address-option-details" style={{ flexGrow: 1 }}>
                      <span className="addr-recipient">{addr.name} - {addr.phone}</span>
                      <span className="addr-text">{addr.address}, {addr.city}, {addr.state} - {addr.zipcode}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-edit-addr"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setAddressData({
                          name: addr.name,
                          phone: addr.phone,
                          address: addr.address,
                          city: addr.city,
                          state: addr.state,
                          zipcode: addr.zipcode,
                          default: addr.default,
                        });
                        setEditingAddressId(addr.id);
                        setShowAddressForm(true);
                      }}
                      title="Edit Address"
                    >
                      <Edit size={16} />
                    </button>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment Section */}
          <section className="checkout-section-card">
            <h2>2. Payment Method</h2>
            
            <div className="payment-options">
              <label className={`payment-option-label ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <CreditCard className="payment-icon" />
                <div className="payment-label-details">
                  <span className="pay-title">Razorpay Secure</span>
                  <span className="pay-desc">UPI, netbanking, wallets.</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Review */}
        <div className="checkout-summary-col">
          <div className="summary-card">
            <h3>Order Review</h3>

            <div className="checkout-products-list">
              {cart?.items.map((item) => (
                <div key={item.id} className="checkout-product-item">
                  <span>{item.product.name} <b>x{item.quantity}</b></span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>

              {coupon && (
                <div className="summary-row discount-row">
                  <span>Discount ({coupon.code})</span>
                  <span>-₹{coupon.discount}</span>
                </div>
              )}

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{calculateFinalAmount()}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-checkout"
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId}
              style={{ color: '#000' }}
            >
              {placingOrder ? 'Processing...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-card">
            <div className="payment-modal-header">
              <div className="secure-badge">
                <Lock size={12} className="lock-icon" />
                <span>SECURE CHECKOUT</span>
              </div>
              <button
                className="close-modal-btn"
                onClick={() => {
                  if (paymentStep !== 'processing' && paymentStep !== 'success') {
                    setShowPaymentModal(false);
                  }
                }}
              >
                <X size={16} />
              </button>
            </div>

            {paymentStep === 'input' && (
              <form onSubmit={handlePaymentSubmit} className="payment-modal-form">
                <div className="modal-amount-row">
                  <span>Pay MaramCraft</span>
                  <span className="modal-amount">₹{calculateFinalAmount()}</span>
                </div>

                {paymentMethod === 'stripe' ? (
                  <div className="stripe-fields">
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <div className="input-with-icon-wrapper">
                        <CreditCard className="field-icon" size={16} />
                        <input
                          type="text"
                          placeholder="4242  4242  4242  4242"
                          className="form-input"
                          maxLength="19"
                          value={cardFields.number}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            let parts = [];
                            for (let i = 0; i < val.length; i += 4) {
                              parts.push(val.substring(i, i + 4));
                            }
                            setCardFields({ ...cardFields, number: parts.join('  ') });
                          }}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group-row">
                      <div className="form-group">
                        <label className="form-label">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="form-input"
                          maxLength="7"
                          value={cardFields.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            if (val.length >= 2) {
                              setCardFields({ ...cardFields, expiry: val.substring(0, 2) + ' / ' + val.substring(2, 4) });
                            } else {
                              setCardFields({ ...cardFields, expiry: val });
                            }
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          className="form-input"
                          maxLength="3"
                          value={cardFields.cvc}
                          onChange={(e) => setCardFields({ ...cardFields, cvc: e.target.value.replace(/[^0-9]/g, '') })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="form-input"
                        value={cardFields.name}
                        onChange={(e) => setCardFields({ ...cardFields, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="razorpay-fields">
                    <div className="razorpay-tabs">
                      <button
                        type="button"
                        className={`razor-tab ${selectedRazorOption === 'upi' ? 'active' : ''}`}
                        onClick={() => setSelectedRazorOption('upi')}
                      >
                        UPI / QR Code
                      </button>
                      <button
                        type="button"
                        className={`razor-tab ${selectedRazorOption === 'netbanking' ? 'active' : ''}`}
                        onClick={() => setSelectedRazorOption('netbanking')}
                      >
                        Netbanking
                      </button>
                    </div>

                    {selectedRazorOption === 'upi' ? (
                      <div className="upi-input-group">
                        <div className="form-group">
                          <label className="form-label">Enter UPI ID</label>
                          <input
                            type="text"
                            placeholder="username@okaxis"
                            className="form-input"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            required
                          />
                        </div>
                        <div className="qr-divider">
                          <span>OR SCAN SECURE QR CODE</span>
                        </div>
                        <div className="mock-qr-container">
                          <div className="mock-qr-code">
                            <div className="qr-corner top-left"></div>
                            <div className="qr-corner top-right"></div>
                            <div className="qr-corner bottom-left"></div>
                            <div className="qr-inner-box"></div>
                            <div className="qr-center-logo">L</div>
                          </div>
                          <span className="qr-scan-label">Scan with PhonePe, GPay, or Paytm</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bank-list">
                        <label className="bank-item">
                          <input type="radio" name="bank" defaultChecked />
                          <span>State Bank of India</span>
                        </label>
                        <label className="bank-item">
                          <input type="radio" name="bank" />
                          <span>HDFC Bank</span>
                        </label>
                        <label className="bank-item">
                          <input type="radio" name="bank" />
                          <span>ICICI Bank</span>
                        </label>
                        <label className="bank-item">
                          <input type="radio" name="bank" />
                          <span>Axis Bank</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="btn btn-primary pay-now-btn" style={{ color: '#000' }}>
                  <Lock size={12} /> Pay Securely ${calculateFinalAmount()}
                </button>
              </form>
            )}

            {paymentStep === 'processing' && (
              <div className="payment-processing-view">
                <div className="spinner-glow">
                  <div className="spinner-inner"></div>
                </div>
                <h3>Securing Payment...</h3>
                <p className="processing-msg-text">{processingMsg}</p>
                <span className="secure-pci-badge">PCI-DSS Compliant • 256-bit SSL</span>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="payment-success-view">
                <div className="success-checkmark-circle">
                  <div className="success-checkmark-stem"></div>
                  <div className="success-checkmark-kick"></div>
                </div>
                <h3>Payment Verified</h3>
                <p>{processingMsg}</p>
              </div>
            )}

            {paymentStep === 'failed' && (
              <div className="payment-failed-view">
                <div className="failed-circle">!</div>
                <h3>Transaction Failed</h3>
                <p>{paymentError}</p>
                <button
                  type="button"
                  className="btn btn-primary try-again-btn"
                  onClick={() => setPaymentStep('input')}
                  style={{ color: '#000' }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .checkout-title {
          margin-bottom: 40px;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
        }
        @media (max-width: 992px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }
        .checkout-section-card {
          background: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 32px;
          margin-bottom: 30px;
        }
        .checkout-section-card h2 {
          font-size: 20px;
          margin-bottom: 24px;
        }
        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .section-title-row h2 {
          margin-bottom: 0;
        }
        .btn-add-new-addr {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-add-new-addr:hover {
          text-decoration: underline;
        }
        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .form-group-row-triple {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .form-actions-addr {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }
        .address-selector-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .address-option-label {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 16px 20px;
          background: var(--bg-card-hover);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .address-option-label input {
          margin-top: 4px;
        }
        .address-option-label.selected {
          border-color: var(--color-primary);
          background: transparent;
        }
        .address-option-details {
          display: flex;
          flex-direction: column;
        }
        .btn-edit-addr {
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .btn-edit-addr:hover {
          color: var(--color-primary);
          background: transparent;
        }
        .addr-recipient {
          font-weight: 600;
          color: var(--color-text-bright);
          margin-bottom: 4px;
        }
        .addr-text {
          font-size: 13px;
          color: var(--color-text-muted);
        }
        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .payment-option-label {
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          padding: 20px;
          background: var(--bg-card-hover);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .payment-option-label.selected {
          border-color: var(--color-primary);
          background: transparent;
        }
        .payment-icon {
          color: var(--color-primary);
          width: 28px;
          height: 28px;
        }
        .payment-label-details {
          display: flex;
          flex-direction: column;
        }
        .pay-title {
          font-weight: 600;
          color: var(--color-text-bright);
        }
        .pay-desc {
          font-size: 12px;
          color: var(--color-text-dim);
        }
        .checkout-products-list {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .checkout-product-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .checkout-totals {
          margin-bottom: 24px;
        }
        .success-container {
          text-align: center;
          padding: 80px 24px;
          max-width: 600px;
          margin: 0 auto;
        }
        .success-icon {
          color: var(--color-success);
          margin-bottom: 24px;
        }
        .success-order-num {
          font-size: 18px;
          color: var(--color-text-bright);
          margin: 12px 0;
        }
        .success-msg {
          color: var(--color-text-muted);
          margin-bottom: 40px;
        }
        .success-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        /* Payment Modal Styles */
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--glass-bg);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .payment-modal-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          width: 100%;
          max-width: 460px;
          padding: 32px;
          box-shadow: var(--glass-shadow);
          position: relative;
        }
        .payment-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }
        .secure-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .lock-icon {
          color: var(--color-primary);
        }
        .close-modal-btn {
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          padding: 4px;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-modal-btn:hover {
          color: var(--color-text-bright);
        }
        .modal-amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: transparent;
          padding: 12px 18px;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
          color: var(--color-text-muted);
          font-size: 14px;
        }
        .modal-amount {
          color: var(--color-primary);
          font-size: 18px;
          font-weight: 700;
        }
        .input-with-icon-wrapper {
          position: relative;
        }
        .input-with-icon-wrapper .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-dim);
        }
        .input-with-icon-wrapper .form-input {
          padding-left: 48px;
        }
        .razorpay-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }
        .razor-tab {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 12px;
          cursor: pointer;
          transition: var(--transition-smooth);
          border-bottom: 2px solid transparent;
        }
        .razor-tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }
        .qr-divider {
          text-align: center;
          border-bottom: 1px solid var(--border-color);
          line-height: 0.1em;
          margin: 24px 0;
          color: var(--color-text-dim);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .qr-divider span {
          background: var(--bg-card);
          padding: 0 10px;
        }
        .mock-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .mock-qr-code {
          width: 140px;
          height: 140px;
          background: #fff;
          border-radius: var(--border-radius-md);
          padding: 12px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-corner {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 4px solid #000;
        }
        .qr-corner.top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .qr-corner.top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; }
        .qr-corner.bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; }
        .qr-inner-box {
          width: 70px;
          height: 70px;
          border: 6px dashed #000;
        }
        .qr-center-logo {
          position: absolute;
          background: var(--color-primary);
          color: #000;
          font-weight: 900;
          font-size: 14px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 2px solid #fff;
        }
        .qr-scan-label {
          font-size: 11px;
          color: var(--color-text-dim);
        }
        .bank-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .bank-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-size: 13px;
          transition: var(--transition-smooth);
        }
        .bank-item:hover {
          border-color: var(--color-primary);
          background: transparent;
        }
        .pay-now-btn {
          width: 100%;
          margin-top: 12px;
        }
        .payment-processing-view, .payment-success-view, .payment-failed-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 0;
        }
        .spinner-glow {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 24px;
        }
        .spinner-inner {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid transparent;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-top-color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .processing-msg-text {
          color: var(--color-text-muted);
          font-size: 14px;
          margin: 8px 0 24px 0;
        }
        .secure-pci-badge {
          font-size: 10px;
          color: var(--color-text-dim);
          letter-spacing: 0.05em;
        }
        .success-checkmark-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 4px solid var(--color-success);
          position: relative;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-checkmark-stem {
          position: absolute;
          width: 4px;
          height: 28px;
          background-color: var(--color-success);
          left: 38px;
          top: 18px;
          transform: rotate(45deg);
        }
        .success-checkmark-kick {
          position: absolute;
          width: 16px;
          height: 4px;
          background-color: var(--color-success);
          left: 24px;
          top: 38px;
          transform: rotate(45deg);
        }
        .failed-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 4px solid var(--color-error);
          color: var(--color-error);
          font-size: 40px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .try-again-btn {
          margin-top: 16px;
        }
      `}</style>
    </div>
  );
}
