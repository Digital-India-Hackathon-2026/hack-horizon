import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Help() {
  const { t } = useTranslation();
  const [openQ, setOpenQ] = useState(0);

  const faqs = [
    { q: t('help.faq_booking'), a: t('help.faq_booking_ans') },
    { q: t('help.faq_token'), a: t('help.faq_token_ans') },
    { q: t('help.faq_queue'), a: t('help.faq_queue_ans') },
    { q: t('help.faq_offline'), a: t('help.faq_offline_ans') },
    { q: t('help.faq_otp'), a: t('help.faq_otp_ans') },
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="page-title animate-in">❓ {t('help.title')}</h1>

        <div className="grid-2" style={{ marginBottom: 40 }}>
          <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
              <h3 style={{ marginBottom: 8 }}>{t('help.contact')}</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>Available Mon-Sat, 8am-6pm</p>
              <a href="tel:18001801551" className="btn btn-primary btn-block">📞 {t('help.phone')}: 1800-180-1551</a>
            </div>
          </div>
          <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <h3 style={{ marginBottom: 8 }}>WhatsApp Support</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>24/7 Automated Assistant</p>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-block" style={{ color: '#25D366', borderColor: '#25D366' }}>
                💬 {t('help.whatsapp')}
              </a>
            </div>
          </div>
        </div>

        <h2 className="section-heading animate-in" style={{ animationDelay: '0.3s' }}>{t('help.faq')}</h2>
        
        <div className="animate-in" style={{ animationDelay: '0.4s' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <div className="accordion-header" onClick={() => setOpenQ(openQ === i ? -1 : i)}>
                <span>{faq.q}</span>
                <span>{openQ === i ? '−' : '+'}</span>
              </div>
              <div className={`accordion-body ${openQ === i ? 'open' : ''}`}>
                <p style={{ color: 'var(--color-text-secondary)' }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
