import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './PaymentModal.css';

const PaymentModal = ({ booking, isOpen, onClose, onSuccess }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !booking) return null;

    const calculateAmount = () => {
        // Assuming booking.hourly_rate exists, or calculate based on booking details
        // In the backend, we fetch the hourly rate from the provider. Here we just display what was passed.
        // We ensure a fallback if total_cost or hourly_rate isn't directly passed.
        const rate = parseFloat(booking.hourly_rate || booking.total_cost || booking.base_price || 0);
        return isNaN(rate) ? 0 : rate;
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        // Format as XXXX XXXX XXXX XXXX
        const parts = [];
        for (let i = 0; i < value.length; i += 4) {
             parts.push(value.substring(i, i + 4));
        }
        
        if (parts.length > 4) {
            return; // Max 16 digits
        }
        
        setCardNumber(parts.join(' '));
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            const month = parseInt(value.substring(0, 2), 10);
            if (month < 1 || month > 12) return;
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        if (value.length > 5) return;
        setCardExpiry(value);
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) return;
        setCardCvv(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (cardNumber.replace(/\s/g, '').length !== 16) {
             setError('Card number must be 16 digits');
             return;
        }

        if (cardExpiry.length !== 5) {
             setError('Expiry must be in MM/YY format');
             return;
        }

        const [month, year] = cardExpiry.split('/');
        const expiryDate = new Date(`20${year}`, parseInt(month) - 1);
        const now = new Date();
        if (expiryDate < new Date(now.getFullYear(), now.getMonth())) {
             setError('Card has expired');
             return;
        }

        if (cardCvv.length !== 3) {
             setError('CVV must be 3 digits');
             return;
        }

        if (!cardHolder.trim()) {
             setError('Cardholder name is required');
             return;
        }

        setLoading(true);

        try {
             const response = await axios.post('/api/payments/initiate', {
                 booking_id: booking.booking_id,
                 card_number: cardNumber.replace(/\s/g, ''),
                 card_expiry: cardExpiry,
                 card_cvv: cardCvv,
                 card_holder_name: cardHolder
             });

             if (response.data.success) {
                 onSuccess(response.data);
             } else {
                 setError(response.data.message || 'Payment failed');
                 setLoading(false);
             }
        } catch (err) {
             console.error('Payment Error:', err);
             setError(err.response?.data?.message || 'An error occurred while processing the payment.');
             setLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="payment-modal-header">
                    <h2>Complete Payment</h2>
                    <span className="test-badge">TEST MODE - Dummy Payment</span>
                    <button className="close-button" onClick={onClose} disabled={loading}>×</button>
                </div>
                
                <div className="payment-summary">
                    <h3>Booking Summary</h3>
                    <p><strong>Service:</strong> {booking.service_name}</p>
                    <p><strong>Provider:</strong> {booking.provider_name}</p>
                    <p className="payment-amount">
                        <strong>Amount due:</strong> ₹{calculateAmount().toFixed(2)}
                    </p>
                </div>

                <form className="payment-form" onSubmit={handleSubmit}>
                    {error && <div className="payment-error">{error}</div>}
                    
                    <div className="form-group">
                        <label>Card Number</label>
                        <input
                            type="text"
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                            type="text"
                            placeholder="Name on card"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group half">
                            <label>Expiry Date</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group half">
                            <label>CVV</label>
                            <input
                                type="password"
                                placeholder="***"
                                value={cardCvv}
                                onChange={handleCvvChange}
                                maxLength={3}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary payment-btn" disabled={loading}>
                        {loading ? (
                            <span className="payment-loading">
                                <span className="spinner"></span> Processing...
                            </span>
                        ) : (
                            `Pay ₹${calculateAmount().toFixed(2)}`
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default PaymentModal;
