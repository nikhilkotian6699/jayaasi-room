'use client';

import { hotel } from '@/lib/mock-data';
import styles from './settings.module.css';

export default function SettingsPage() {
  return (
    <div className="animate-in">
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.eyebrow}>JAYAASI ROOMS · BUSINESS SUITE</div>
          <h1 className={styles.title}>Hotel Settings</h1>
          <p className={styles.subtitle}>Manage your property details and guest experience.</p>
        </div>
        <button className="btn btn-primary">Save changes</button>
      </div>

      <div className={styles.settingsGrid}>
        <section className={styles.section}>
          <h3>Property details</h3>
          <p>These details are visible to guests.</p>
          <div className="field">
            <label>Hotel name</label>
            <input defaultValue={hotel.name} />
          </div>
          <div className="field">
            <label>Property type</label>
            <select defaultValue={hotel.type}>
              <option>Business Suite</option>
              <option>Hotel</option>
              <option>Guest house</option>
            </select>
          </div>
          <div className="field">
            <label>Address</label>
            <input defaultValue={hotel.address} />
          </div>
          <div className="field">
            <label>Front desk phone</label>
            <input defaultValue={hotel.phone} />
          </div>
        </section>

        <section className={styles.section}>
          <h3>Guest experience</h3>
          <p>Configure how guests access hotel services.</p>
          {[
            { label: 'Room QR access', desc: 'Let guests open their room page without an account.', key: 'qrAccess' },
            { label: 'Guest phone verification', desc: 'Ask guests to verify before submitting a request.', key: 'phoneVerification' },
            { label: 'WhatsApp updates', desc: 'Send guest request updates on WhatsApp.', key: 'whatsappUpdates' },
            { label: 'Guest feedback prompt', desc: 'Ask for a rating after request completion.', key: 'feedbackPrompt' },
          ].map((setting) => (
            <div className={styles.toggleRow} key={setting.key}>
              <div>
                <strong>{setting.label}</strong>
                <small>{setting.desc}</small>
              </div>
              <button className={`switch ${hotel.settings[setting.key] ? 'on' : ''}`} role="switch"></button>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h3>Check-in & check-out</h3>
          <p>Shown on the guest room information page.</p>
          <div className="field">
            <label>Check-in time</label>
            <input type="time" defaultValue={hotel.checkIn} />
          </div>
          <div className="field">
            <label>Check-out time</label>
            <input type="time" defaultValue={hotel.checkOut} />
          </div>
        </section>

        <section className={styles.section}>
          <h3>Room QR codes</h3>
          <p>One secure QR code for every guest room.</p>
          <div className={styles.toggleRow}>
            <div>
              <strong>36 room codes active</strong>
              <small>Last generated on 18 September 2026.</small>
            </div>
            <button className="btn btn-sm">Download QR pack</button>
          </div>
          <div className={styles.toggleRow}>
            <div>
              <strong>Guest room page</strong>
              <small>jayaasi.in/stay/••••••</small>
            </div>
            <button className="btn-ghost">Copy link</button>
          </div>
        </section>
      </div>
    </div>
  );
}
