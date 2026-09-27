'use client';

import { orders } from '@/lib/mock-data';
import { statusClass, formatPrice } from '@/lib/utils';
import styles from './orders.module.css';

export default function StaffOrdersPage() {
  return (
    <div className="animate-in">
      <h1 className={styles.title}>Kitchen Orders</h1>

      <div className={styles.orderGrid}>
        {orders.map(order => (
          <div className={`card ${styles.orderCard}`} key={order.id}>
            <div className={styles.orderHeader}>
              <div>
                <div className={styles.orderRoom}>Room {order.room}</div>
                <div className={styles.orderGuest}>{order.guest}</div>
              </div>
              <span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span>
            </div>

            <div className={styles.orderItems}>
              {order.items.map((item, i) => (
                <div className={styles.orderItem} key={i}>
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>

            <div className={styles.orderFooter}>
              <div className={styles.orderTotal}>
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              <div className={styles.orderActions}>
                {order.status === 'New' && <button className="btn btn-primary btn-sm">Accept</button>}
                {order.status === 'Preparing' && <button className="btn btn-sm">Ready</button>}
                {order.status === 'Ready' && <button className="btn btn-primary btn-sm">Delivered</button>}
              </div>
            </div>

            <div className={styles.orderTime}>{order.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
