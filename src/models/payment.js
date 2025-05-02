class Payment {
    constructor(id, enrollment_id, amount, is_paid, paid_at, payment_proof_url, verified, verified_at) {
      this.id = id;
      this.enrollment_id = enrollment_id;
      this.amount = amount;
      this.is_paid = is_paid;
      this.paid_at = paid_at;
      this.payment_proof_url = payment_proof_url;
      this.verified = verified;
      this.verified_at = verified_at;
    }
  }
  
  module.exports = Payment;
  