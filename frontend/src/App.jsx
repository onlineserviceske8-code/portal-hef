import { useState, useEffect } from 'react'
import './App.css'

function Header() {
  return (
    <div className="header-section">
      <header className="header">
        <div className="header-wrapper">
          <div className="header-left">
            <div className="header-logos">
              <img src="https://portal.hef.co.ke/assets/assets/images/TVET.png" alt="TVET" />
              <img src="https://portal.hef.co.ke/assets/assets/images/kuccps_logo.png" alt="KUCCPS" />
              <img src="https://portal.hef.co.ke/assets/app-assets/images/logo/logo-login.png" alt="HEF Logo" className="main-logo" />
              <img src="https://portal.hef.co.ke/assets/assets/images/ufb.png" alt="UFB" />
            </div>
            <div className="header-title">
              <h3><b> HIGHER EDUCATION FINANCING PORTAL </b></h3>
              <span className="header-sep">|</span>
              <span className="header-tagline">Fostering Equity in Access to Education.</span>
            </div>
          </div>
        </div>
      </header>
      
      <nav className="horizontal-menu" role="navigation">
        <div className="navbar-container main-menu-content">
          <ul className="nav navbar-nav" id="main-menu-navigation">
            <li className="nav-item">
              <a className="nav-link" href="https://www.hef.co.ke/" target="_blank" rel="noopener noreferrer" style={{ color: '#000' }}>
                <span>Back to HEF Website</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" style={{ color: '#000' }} onClick={(e) => e.preventDefault()}>
                <span>Account Login</span>
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link" href="#" style={{ color: '#000' }} onClick={(e) => e.preventDefault()}>
                <span>User Registration</span>
              </a>
              <div className="dropdown-content">
                <a href="https://portal.hef.co.ke/auth/signup" target="_blank" rel="noopener noreferrer">
                  <span>Applicant Registration</span>
                </a>
                <a href="https://employers.helb.co.ke/login" target="_blank" rel="noopener noreferrer">
                  <span>Employer Registration</span>
                </a>
                <a href="https://portal.hef.co.ke/auth/signup/funder" target="_blank" rel="noopener noreferrer">
                  <span>Partner Funds Registration</span>
                </a>
                <a href="https://portal.hef.co.ke/auth/signup/debt" target="_blank" rel="noopener noreferrer">
                  <span>Debt Collector Registration</span>
                </a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" style={{ color: '#000' }} onClick={(e) => e.preventDefault()}>
                <span>Application Guide</span>
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link" href="#" style={{ color: '#000' }} onClick={(e) => e.preventDefault()}>
                <span>Documents</span>
              </a>
              <div className="dropdown-content">
                <a href="https://www.helb.co.ke/wp-content/uploads/2019/08/HELB-ENQUIRY-FORM-EF12018.pdf" target="_blank" rel="noopener noreferrer">
                  <span>HELB ENQUIRY FORM</span>
                </a>
                <a href="https://www.helb.co.ke/wp-content/uploads/2019/08/HELB-Student-Details-Change-Request-Form-RF-1-2019-002.pdf" target="_blank" rel="noopener noreferrer">
                  <span>BANK DETAILS CHANGE REQUEST FORM</span>
                </a>
              </div>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" style={{ color: '#000' }} onClick={(e) => e.preventDefault()}>
                <span>HELB Checker</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#">Application Guide</a>
        <div className="dropdown">
          <button className="dropdown-btn">Documents</button>
          <div className="dropdown-content">
            <a href="https://www.helb.co.ke/wp-content/uploads/2019/08/HELB-ENQUIRY-FORM-EF12018.pdf" target="_blank" rel="noopener noreferrer">HELB ENQUIRY FORM</a>
            <a href="https://www.helb.co.ke/wp-content/uploads/2019/08/HELB-Student-Details-Change-Request-Form-RF-1-2019-002.pdf" target="_blank" rel="noopener noreferrer">BANK DETAILS CHANGE REQUEST FORM</a>
          </div>
        </div>
        <a href="#">HELB Checker</a>
      </div>
    </footer>
  )
}

function LoginPage({ onLogin, onGoToSignup }) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  })
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleKeyDown = (e) => {
    setCapsLock(e.getModifierState('CapsLock'))
  }

  const API_URL = import.meta.env.VITE_API_URL || '';

const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-layout">
      <div className="login-container">
        <div className="card border-grey border-lighten-3 m-0">
            <div className="card-header border-0">
              <div className="card-title text-center">
                <img className="brand-logos" alt="Logo" src="https://portal.hef.co.ke/assets/assets/images/GOK.png" style={{ width: '40px', height: '40px' }} />
              </div>
              <h6 className="card-subtitle line-on-side text-muted text-center font-small-3 pt-2" style={{ marginBottom: '0px', paddingBottom: '0px' }}>
                <span>Sign in to your Account</span>
              </h6>
              <input name="base_url" type="hidden" id="base_url" value="https://portal.hef.co.ke/" />
            </div>
            <div className="card-content">
              <div className="card-body">

                <form className="form-horizontal form-login" id="form-login" onSubmit={handleSubmit}>

                  <div className="msg_act alert alert-secondary" role="alert">
                    <h5 className="title text-center"><b>Register if you dont have an account by <a href="https://portal.hef.co.ke/auth/signup" target="_blank" rel="noopener noreferrer">{'Clicking Here >>'}</a></b></h5>
                  </div>
                  <div className="msg_act alert alert-cyan" role="alert">
                    <h5 className="title">Log in with your email or ID number and password below. </h5>
                  </div>

                  <div className="message alert alert-danger" id="msg" style={{ display: 'none', fontWeight: 'bold' }}>Caps Lock is ON</div>

                  <fieldset className="form-group position-relative has-icon-left">
                    <input type="text" className="form-control input-lg" name="identifier" id="form-email_add" placeholder="Enter your email or ID number"
                      tabIndex="1" required data-validation-required-message="Please enter valid email address or ID number." value={formData.identifier} onChange={handleChange} onKeyDown={handleKeyDown} autoComplete="username" />
                    <div className="form-control-position">
                      <i className="ft-user"></i>
                    </div>
                    <div className="help-block font-small-3"></div>
                  </fieldset>
                  <fieldset className="form-group position-relative has-icon-left">
                    <input type="password" className="form-control input-lg pr-5" tabIndex="2" required data-validation-required-message="Please enter valid passwords." id="form-password" name="password" placeholder="Enter Password" autoComplete="new-password" value={formData.password} onChange={handleChange} onKeyDown={handleKeyDown} />
                    <span id="toggle-password" className="password-toggle" onClick={() => {
                      const input = document.getElementById('form-password');
                      const icon = document.getElementById('toggle-password');
                      if (input.type === 'password') {
                        input.type = 'text';
                        icon.innerHTML = '<i class="ft-eye-off"></i>';
                      } else {
                        input.type = 'password';
                        icon.innerHTML = '<i class="ft-eye"></i>';
                      }
                    }}> <i className="ft-eye"></i> </span>
                    <div className="form-control-position">
                      <i className="ft-lock"></i>
                    </div>
                    {capsLock && <div className="caps-warning">Caps Lock is ON</div>}
                  </fieldset>
                  <div className="form-group row">
                    <div className="col-md-6 col-12 text-center text-md-left">
                      <fieldset>
                        <input type="checkbox" id="remember-me" className="chk-remember" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                        <label htmlFor="remember-me"> Remember Me</label>
                      </fieldset>
                    </div>
                    <div className="col-md-6 col-12 text-center text-md-right">
                      <a href="https://portal.hef.co.ke/auth/index/forgot" className="card-link" target="_blank" rel="noopener noreferrer">Forgot Password?</a>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success btn-block btn-lg btn-signin" disabled={loading}><i className="ft-unlock"></i> {loading ? 'Signing in...' : 'Login'}</button>
                </form>
              </div>
            </div>
            <div className="card-footer border-0" style={{ marginTop: '0px', paddingTop: '0px' }}>
              <p className="card-subtitle line-on-side text-muted text-center font-small-3 mx-2 my-1">
                <span>Don't Have An Account ?</span>
              </p>
              <a href="https://portal.hef.co.ke/auth/signup" className="btn btn-info btn-block btn-lg mt-3 register-btn" target="_blank" rel="noopener noreferrer"><i className="ft-user"></i> Register</a>
            </div>
          </div>
        </div>
      </div>
  )
}

function SignupPage({ onSignup }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    idNumber: '',
    password: '',
    confirmPassword: '',
    userType: 'applicant'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentPending, setPaymentPending] = useState(false)
  const [paymentModal, setPaymentModal] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format')
      return
    }

    if (formData.email !== formData.confirmEmail) {
      setError('Email addresses do not match')
      return
    }

    // Check if payment is completed
    const paymentKey = `payment_${formData.email}`
    const paymentStatus = localStorage.getItem(paymentKey)
    if (paymentStatus !== 'completed') {
      setPaymentPending(true)
      initiatePayment(formData)
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          idNumber: formData.idNumber,
          password: formData.password,
          userType: formData.userType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async (registrationData) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registrationData,
          amount: 1000,
          phoneNumber: formData.idNumber, // Use ID number as phone for STK push
          accountNumber: '0085060049062',
          email: 'onlineserviceske8@gmail.com'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed')
      }

      // Store pending registration data
      localStorage.setItem('pending_registration', JSON.stringify(registrationData))
      
      // Show payment modal with STK push info
      setPaymentModal({
        status: 'pending',
        message: 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment of KES 1,000.',
        orderTrackingId: data.order_tracking_id,
        merchant_reference: data.merchant_reference
      })
    } catch (err) {
      setError(err.message)
      setPaymentPending(false)
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (orderTrackingId) => {
    try {
      const response = await fetch(`${API_URL}/api/payment/status/${orderTrackingId}`)
      const data = await response.json()
      
      if (data.status === 'COMPLETED') {
        setPaymentModal({ status: 'success', message: 'Payment completed successfully! Completing registration...' })
        // Complete registration
        completeRegistration()
      } else if (data.status === 'FAILED') {
        setPaymentModal({ status: 'error', message: 'Payment failed. Please try again.' })
        setPaymentPending(false)
      } else {
        // Still pending, check again in 5 seconds
        setTimeout(() => checkPaymentStatus(orderTrackingId), 5000)
      }
    } catch (err) {
      console.error('Payment status check failed:', err)
    }
  }

  const completeRegistration = async () => {
    const registrationData = JSON.parse(localStorage.getItem('pending_registration'))
    if (!registrationData) return

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem(`payment_${registrationData.email}`, 'completed')
      localStorage.removeItem('pending_registration')
      setSuccess(true)
      setPaymentModal(null)
    } catch (err) {
      setError(err.message)
      setPaymentModal({ status: 'error', message: 'Registration failed after payment. Please contact support.' })
    }
  }

  if (success) {
    return (
      <div className="login-page-layout">
        <div className="login-container">
          <div className="login-card success-card">
            <div className="success-icon">&#10003;</div>
            <h2>Registration Successful!</h2>
            <p className="success-message">Welcome to the Higher Education Financing Portal, {formData.fullName}.</p>
            <p className="success-message">Please complete your appeal application to continue.</p>
            <button onClick={() => onSignup(formData)} className="login-btn continue-btn">
              <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
              Continue to Appeal Application
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page-layout">
      <div className="login-container">
        <div className="login-card signup-card">
          <div className="login-card-header">
            <h2>Create Your Account</h2>
          </div>
          <div className="login-card-body">
            <p className="instruction">Fill in your details below to register for the portal.</p>

            {error && <div className="error-message">{error}</div>}

            {!paymentPending ? (
              <form onSubmit={handleSubmit} className="login-form signup-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon user"></span>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon email"></span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmEmail">Confirm Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon email"></span>
                    <input
                      type="email"
                      id="confirmEmail"
                      name="confirmEmail"
                      value={formData.confirmEmail}
                      onChange={handleChange}
                      placeholder="Confirm your email"
                      required
                      autoComplete="email"
                    />
                  </div>
                  {formData.confirmEmail && formData.email !== formData.confirmEmail && (
                    <span className="password-match invalid">&#10007; Email addresses do not match</span>
                  )}
                  {formData.confirmEmail && formData.email === formData.confirmEmail && formData.email && (
                    <span className="password-match valid">&#10003; Email addresses match</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="idNumber">ID Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon id"></span>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      placeholder="Enter your ID number"
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userType">User Type</label>
                  <div className="input-wrapper">
                    <span className="input-icon user"></span>
                    <select
                      id="userType"
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      required
                    >
                      <option value="applicant">Applicant</option>
                      <option value="employer">Employer</option>
                      <option value="funder">Partner Fund</option>
                      <option value="debt_collector">Debt Collector</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon lock"></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password (min 6 characters)"
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      <i className={showPassword ? 'fas fa-eye-off' : 'fas fa-eye'}></i>
                    </span>
                  </div>
                  <div className="password-strength">
                    <div className="strength-bar">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={passwordStrength >= i ? 'active' : ''}></div>
                      ))}
                    </div>
                    <div className="strength-label">
                      {passwordStrength === 0 ? 'Password Strength' : 
                       passwordStrength <= 1 ? 'Weak' : 
                       passwordStrength === 2 ? 'Fair' : 
                       passwordStrength === 3 ? 'Good' : 
                       passwordStrength === 4 ? 'Strong' : 'Very Strong'}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon check"></span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      autoComplete="new-password"
                    />
                    <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <i className={showConfirmPassword ? 'fas fa-eye-off' : 'fas fa-eye'}></i>
                    </span>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <span className="password-match invalid">&#10007; Passwords do not match</span>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                    <span className="password-match valid">&#10003; Passwords match</span>
                  )}
                </div>

                <div className="payment-section">
                  <h4>Registration Fee</h4>
                  <div className="payment-info">
                    <div className="payment-icon">
                      <i className="fas fa-credit-card"></i>
                    </div>
                    <div className="payment-details">
                      <h5>Account Verification Payment</h5>
                      <p className="payment-amount">KES 1,000</p>
                      <p>Payable to Account: 0085060049062</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#856404', marginBottom: '1rem' }}>
                    A one-time registration fee of KES 1,000 is required to verify your account. 
                    Payment will be processed via M-Pesa STK Push to the phone number associated with your ID.
                  </p>
                </div>

                <button type="submit" className="payment-btn" disabled={loading}>
                  <i className="fas fa-credit-card" style={{ marginRight: '8px' }}></i>
                  {loading ? 'Processing Payment...' : 'Register & Pay KES 1,000'}
                </button>
              </form>
            ) : (
<div className="text-center" style={{ padding: '1rem' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid #e0e0e0', borderTopColor: '#28a745', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <p style={{ fontSize: '12px', color: '#888' }}>Please check your phone for the STK Push prompt</p>
              </div>
            )}

            <div className="signup-prompt">
              <p>Already have an account?</p>
              <a href="#" onClick={(e) => { e.preventDefault(); onSignup(null); }}>Sign In</a>
            </div>
          </div>
        </div>
      </div>

      {paymentModal && (
        <div className="payment-modal-overlay" onClick={() => setPaymentModal(null)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Payment Status</h3>
            <div className="payment-status">
              {paymentModal.status === 'pending' && (
                <>
                  <div className="status-icon pending">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="status-text">{paymentModal.message}</div>
                  <div className="status-details">
                    Order ID: {paymentModal.orderTrackingId || paymentModal.merchant_reference}
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '12px', color: '#888' }}>
                    Please complete the payment on your phone. This window will close automatically upon success.
                  </div>
                </>
              )}
              {paymentModal.status === 'success' && (
                <>
                  <div className="status-icon success">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="status-text">{paymentModal.message}</div>
                </>
              )}
              {paymentModal.status === 'error' && (
                <>
                  <div className="status-icon error">
                    <i className="fas fa-x-circle"></i>
                  </div>
                  <div className="status-text">{paymentModal.message}</div>
                  <div className="modal-actions">
                    <button className="btn-secondary" onClick={() => { setPaymentModal(null); setPaymentPending(false); }}>Try Again</button>
                    <button className="login-btn" onClick={() => { setPaymentModal(null); setPaymentPending(false); }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AppealApplicationPage({ user, onSubmitAppeal }) {
  const [formData, setFormData] = useState({
    institution: '',
    course: '',
    yearOfStudy: '',
    admissionNumber: '',
    appealReason: '',
    supportingDocuments: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState(new Set([1]))

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData(prev => ({ ...prev, [name]: files ? Array.from(files) : value }))
  }

  const handleNext = () => {
    if (activeStep === 1) {
      if (!formData.institution || !formData.course || !formData.yearOfStudy || !formData.admissionNumber) {
        setError('Please fill in all required fields')
        return
      }
    } else if (activeStep === 2) {
      if (!formData.appealReason) {
        setError('Please provide a reason for your appeal')
        return
      }
    }
    setError('')
    setCompletedSteps(prev => new Set([...prev, activeStep]))
    setActiveStep(prev => prev + 1)
  }

  const handlePrev = () => {
    setError('')
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/appeals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit appeal')
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="login-page-layout">
        <div className="login-container">
          <div className="login-card success-card">
            <div className="success-icon">&#10003;</div>
            <h2>Appeal Submitted Successfully!</h2>
            <p className="success-message">Your appeal application has been received and is under review.</p>
            <p className="success-message">Reference Number: <strong>APL-{Date.now().toString().slice(-8)}</strong></p>
            <p className="success-message">You will be notified via email once a decision is made.</p>
            <button onClick={onSubmitAppeal} className="login-btn continue-btn">
              <i className="fas fa-home" style={{ marginLeft: '8px' }}></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStepClass = (stepNum) => {
    if (stepNum === activeStep) return 'step active'
    if (completedSteps.has(stepNum)) return 'step completed'
    return 'step'
  }

  return (
    <div className="login-page-layout">
      <div className="login-container">
        <div className="login-card appeal-card">
          <div className="login-card-header">
            <h2>Appeal Application</h2>
          </div>
          <div className="login-card-body">
            <div className="progress-steps">
              <div className={getStepClass(1)}>
                <span className="step-number">{completedSteps.has(1) && activeStep > 1 ? '' : '1'}</span>
                <span className="step-label">Academic Details</span>
              </div>
              <div className={getStepClass(2)}>
                <span className="step-number">{completedSteps.has(2) && activeStep > 2 ? '' : '2'}</span>
                <span className="step-label">Appeal Reason</span>
              </div>
              <div className={getStepClass(3)}>
                <span className="step-number">{completedSteps.has(3) && activeStep > 3 ? '' : '3'}</span>
                <span className="step-label">Documents</span>
              </div>
              <div className={getStepClass(4)}>
                <span className="step-number">4</span>
                <span className="step-label">Submit</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="appeal-form">
              {activeStep === 1 && (
                <div className="form-step">
                  <h3>Academic Details</h3>
                  <p className="instruction">Please provide your current academic information.</p>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="institution">Institution</label>
                      <div className="input-wrapper">
                        <span className="input-icon user"></span>
                        <input
                          type="text"
                          id="institution"
                          name="institution"
                          value={formData.institution}
                          onChange={handleChange}
                          placeholder="e.g. University of Nairobi"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="course">Course/Program</label>
                      <div className="input-wrapper">
                        <span className="input-icon user"></span>
                        <input
                          type="text"
                          id="course"
                          name="course"
                          value={formData.course}
                          onChange={handleChange}
                          placeholder="e.g. Bachelor of Science in Nursing"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="yearOfStudy">Year of Study</label>
                      <div className="input-wrapper">
                        <span className="input-icon user"></span>
                        <select
                          id="yearOfStudy"
                          name="yearOfStudy"
                          value={formData.yearOfStudy}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select year</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                          <option value="5">Year 5</option>
                          <option value="6">Year 6+</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="admissionNumber">Admission Number</label>
                      <div className="input-wrapper">
                        <span className="input-icon id"></span>
                        <input
                          type="text"
                          id="admissionNumber"
                          name="admissionNumber"
                          value={formData.admissionNumber}
                          onChange={handleChange}
                          placeholder="Enter your admission number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="form-step">
                  <h3>Appeal Reason</h3>
                  <p className="instruction">Explain why you are appealing for financial assistance.</p>
                  
                  <div className="form-group">
                    <label htmlFor="appealReason">Reason for Appeal</label>
                    <textarea
                      id="appealReason"
                      name="appealReason"
                      value={formData.appealReason}
                      onChange={handleChange}
                      placeholder="Describe your financial situation and why you need assistance..."
                      required
                      rows={6}
                    />
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="form-step">
                  <h3>Supporting Documents</h3>
                  <p className="instruction">Upload any supporting documents (optional but recommended).</p>
                  
                  <div className="form-group">
                    <label>Upload Documents</label>
                    <input
                      type="file"
                      name="supportingDocuments"
                      onChange={handleChange}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="file-hint">Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)</p>
                  </div>

                  {formData.supportingDocuments.length > 0 && (
                    <div className="uploaded-files">
                      {formData.supportingDocuments.map((file, index) => (
                        <div key={index} className="file-item">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeStep === 4 && (
                <div className="form-step">
                  <h3>Review & Submit</h3>
                  <p className="instruction">Please review your information before submitting.</p>
                  
                  <div className="review-section">
                    <h4>Academic Details</h4>
                    <p><strong>Institution:</strong> {formData.institution}</p>
                    <p><strong>Course:</strong> {formData.course}</p>
                    <p><strong>Year of Study:</strong> {formData.yearOfStudy}</p>
                    <p><strong>Admission Number:</strong> {formData.admissionNumber}</p>
                    
                    <h4>Appeal Reason</h4>
                    <p>{formData.appealReason}</p>
                    
                    <h4>Documents</h4>
                    <p>{formData.supportingDocuments.length > 0 
                      ? formData.supportingDocuments.map(f => f.name).join(', ')
                      : 'No documents uploaded'}</p>
                  </div>

                  <div className="declaration">
                    <label className="checkbox-label">
                      <input type="checkbox" required />
                      I declare that the information provided is true and accurate to the best of my knowledge.
                    </label>
                  </div>
                </div>
              )}

              <div className="form-navigation">
                {activeStep > 1 && (
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Previous
                  </button>
                )}
                {activeStep < 4 ? (
                  <button type="button" className="login-btn" onClick={handleNext}>
                    Next
<i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                  </button>
                ) : (
                  <button type="submit" className="login-btn" disabled={loading}>
                    <i className="fas fa-send" style={{ marginLeft: '8px' }}></i>
                    {loading ? 'Submitting...' : 'Submit Appeal'}
                  </button>
                )}
              </div>
</form>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardPage({ user, onLogout, onStartAppeal }) {
  return (
    <div className="login-page-layout">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Welcome, {user.fullName}</h1>
          <p>ID Number: {user.idNumber} | Email: {user.email}</p>
        </div>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>My Applications</h3>
            <p>View and manage your funding applications</p>
            <button className="btn-secondary" onClick={onStartAppeal}>
              <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
              New Appeal
            </button>
          </div>
          <div className="dashboard-card">
            <h3>Appeal Status</h3>
            <p>Check the status of your submitted appeals</p>
            <button className="btn-secondary">
              <i className="fas fa-file-text" style={{ marginRight: '8px' }}></i>
              View Appeals
            </button>
          </div>
          <div className="dashboard-card">
            <h3>Profile Settings</h3>
            <p>Update your personal information</p>
            <button className="btn-secondary">
              <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
              Edit Profile
            </button>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <i className="fas fa-log-out" style={{ marginRight: '8px' }}></i>
          Logout
        </button>
      </div>
    </div>
  )
}

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setPage('dashboard')
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setPage('login')
  }

  const handleGoToSignup = () => {
    setPage('signup')
  }

  const handleSignup = (userData) => {
    if (userData) {
      setUser(userData)
      setPage('appeal')
    } else {
      setPage('login')
    }
  }

  const handleStartAppeal = () => {
    setPage('appeal')
  }

  const handleAppealSubmitted = () => {
    setPage('dashboard')
  }

  const renderPage = () => {
    switch (page) {
      case 'signup':
        return <SignupPage onSignup={handleSignup} />
      case 'appeal':
        return user ? <AppealApplicationPage user={user} onSubmitAppeal={handleAppealSubmitted} /> : <LoginPage onLogin={handleLogin} onGoToSignup={handleGoToSignup} />
      case 'dashboard':
        return user ? <DashboardPage user={user} onLogout={handleLogout} onStartAppeal={handleStartAppeal} /> : <LoginPage onLogin={handleLogin} onGoToSignup={handleGoToSignup} />
      default:
        return <LoginPage onLogin={handleLogin} onGoToSignup={handleGoToSignup} />
    }
  }

  return (
    <div className="hef-portal">
      <Header />
      <main className="main-content">
        <div className="page-wrapper">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App




































































































