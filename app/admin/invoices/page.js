'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ALL_ROOM_INVOICES, SUITE_ROOMS } from '@/lib/admin-data';

function InvoicesContent() {
  const searchParams = useSearchParams();
  const roomParam = searchParams ? searchParams.get('room') : null;

  const [invoices, setInvoices] = useState(ALL_ROOM_INVOICES);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(roomParam || '204');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);

  // New Charge form
  const [newCharge, setNewCharge] = useState({
    category: 'In-Room Dining',
    description: '',
    amount: '',
  });

  useEffect(() => {
    if (roomParam && invoices.some((inv) => inv.room === roomParam)) {
      setSelectedRoomNumber(roomParam);
    }
  }, [roomParam, invoices]);

  const selectedInvoice = invoices.find((inv) => inv.room === selectedRoomNumber) || invoices[0];

  const handleSettle = (roomNum) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.room === roomNum ? { ...inv, paymentStatus: 'Settled & Paid' } : inv
      )
    );
  };

  const handleAddCharge = (e) => {
    e.preventDefault();
    if (!newCharge.description || !newCharge.amount) return;

    const amt = parseFloat(newCharge.amount);
    if (isNaN(amt) || amt <= 0) return;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.room === selectedRoomNumber) {
          const updatedItems = [
            ...inv.lineItems,
            {
              id: inv.lineItems.length + 1,
              date: '05 Oct',
              category: newCharge.category,
              description: newCharge.description,
              amount: amt,
            },
          ];
          const newSubtotal = updatedItems.reduce((acc, itm) => acc + itm.amount, 0);
          const newCgst = Math.round(newSubtotal * 0.025 * 100) / 100;
          const newSgst = Math.round(newSubtotal * 0.025 * 100) / 100;
          const newGrandTotal = newSubtotal + newCgst + newSgst;

          return {
            ...inv,
            lineItems: updatedItems,
            subtotal: newSubtotal,
            cgst: newCgst,
            sgst: newSgst,
            grandTotal: newGrandTotal,
          };
        }
        return inv;
      })
    );

    setShowAddChargeModal(false);
    setNewCharge({ category: 'In-Room Dining', description: '', amount: '' });
  };

  const totalHotelRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);

  return (
    <div>
      {/* Top Header Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
            Guest Folio & Invoices Hub — All Rooms
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Total Hotel Billed Folio Balance across all suites: <strong style={{ color: '#7a0c24' }}>₹{totalHotelRevenue.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddChargeModal(true)}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>➕</span>
            <span>Post Charge to Room {selectedInvoice.room}</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🖨️</span>
            <span>Print Invoice (Room {selectedInvoice.room})</span>
          </button>

          {selectedInvoice.paymentStatus !== 'Settled & Paid' ? (
            <button
              onClick={() => handleSettle(selectedInvoice.room)}
              style={{
                background: '#7a0c24',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>💳</span>
              <span>Settle Room {selectedInvoice.room} Folio</span>
            </button>
          ) : (
            <div
              style={{
                background: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>✓</span>
              <span>Room {selectedInvoice.room} Settled</span>
            </div>
          )}
        </div>
      </div>

      {/* Room Selector Tab Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
          Select Suite / Room Folio to Manage:
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
          {invoices.map((inv) => {
            const isSelected = inv.room === selectedRoomNumber;
            return (
              <button
                key={inv.room}
                onClick={() => setSelectedRoomNumber(inv.room)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid #7a0c24' : '1px solid #cbd5e1',
                  background: isSelected ? '#7a0c24' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '165px',
                  boxShadow: isSelected ? '0 4px 14px rgba(122,12,36,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <strong style={{ fontSize: '14px' }}>Suite {inv.room}</strong>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {inv.paymentStatus === 'Settled & Paid' ? 'PAID' : 'DUE'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {inv.guestName}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#f5df97' : '#7a0c24', marginTop: '3px' }}>
                  ₹{inv.grandTotal.toLocaleString('en-IN')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Room Folio Summary Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Folio & Invoice Number
          </span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {selectedInvoice.invoiceNumber}
          </div>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>● GST Official Compliant</span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Suite & Guest Contact
          </span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#7a0c24', marginTop: '4px' }}>
            Room {selectedInvoice.room} — {selectedInvoice.suiteName}
          </div>
          <span style={{ fontSize: '12px', color: '#475569' }}>
            {selectedInvoice.guestName} · {selectedInvoice.phone}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Stay Duration
          </span>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {selectedInvoice.checkInDate.split(',')[0]} → {selectedInvoice.checkOutDate.split(',')[0]}
          </div>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Check-out: {selectedInvoice.checkOutDate.split(',')[1]}</span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Folio Billing Status
          </span>
          <div style={{ marginTop: '4px' }}>
            <span
              style={{
                background: selectedInvoice.paymentStatus === 'Settled & Paid' ? '#d1fae5' : '#ede9fe',
                color: selectedInvoice.paymentStatus === 'Settled & Paid' ? '#065f46' : '#5b21b6',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {selectedInvoice.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table for Selected Room */}
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              Room {selectedInvoice.room} ({selectedInvoice.suiteName}) — Itemized Folio Charges
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Guest: <strong>{selectedInvoice.guestName}</strong> · Room tariffs, in-room dining, garment care, concierge cab & store charges
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#7a0c24' }}>
            {selectedInvoice.lineItems.length} Billed Items
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Service / Item Description</th>
              <th style={{ textAlign: 'right' }}>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td style={{ color: '#64748b', fontSize: '13px' }}>{item.date}</td>
                <td>
                  <span
                    style={{
                      background: '#f1f5f9',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#475569',
                    }}
                  >
                    {item.category}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#1e293b' }}>{item.description}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation Summary Footer */}
        <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '360px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px' }}>
              <span style={{ color: '#64748b' }}>Subtotal:</span>
              <strong style={{ color: '#0f172a' }}>₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px' }}>
              <span style={{ color: '#64748b' }}>CGST (2.5%):</span>
              <span style={{ color: '#0f172a' }}>₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13.5px' }}>
              <span style={{ color: '#64748b' }}>SGST (2.5%):</span>
              <span style={{ color: '#0f172a' }}>₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0 0',
                borderTop: '2px solid #0f172a',
                fontSize: '18px',
                fontWeight: 800,
                color: '#7a0c24',
                marginTop: '6px',
              }}
            >
              <span>Room {selectedInvoice.room} Total:</span>
              <span>₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Charge Modal */}
      {showAddChargeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowAddChargeModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Post Charge to Room {selectedInvoice.room}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Guest: {selectedInvoice.guestName} ({selectedInvoice.suiteName})
                </span>
              </div>
              <button
                onClick={() => setShowAddChargeModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCharge} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Department / Charge Category:
                </label>
                <select
                  value={newCharge.category}
                  onChange={(e) => setNewCharge({ ...newCharge, category: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="In-Room Dining">In-Room Dining</option>
                  <option value="Mini Bar">Mini Bar</option>
                  <option value="Laundry Care">Laundry Care</option>
                  <option value="Shoe Care">Shoe Care</option>
                  <option value="Cab Concierge">Cab Concierge</option>
                  <option value="Jayaasi Store">Jayaasi Store</option>
                  <option value="Spa & Wellness">Spa & Wellness</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Item Description:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Red Wine, Extra Bedding, Express Ironing"
                  value={newCharge.description}
                  onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Amount (₹ excl. GST):
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 750"
                  value={newCharge.amount}
                  onChange={(e) => setNewCharge({ ...newCharge, amount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Taxes (2.5% CGST + 2.5% SGST) will be automatically computed and added to the folio.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddChargeModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#7a0c24', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add Charge to Folio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal for Selected Room */}
      {showPrintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="invoice-print-card"
            style={{ width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button
                onClick={() => setShowPrintModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Official Hotel Invoice Header */}
            <div className="invoice-header-top">
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#7a0c24' }}>
                  JAYAASI ROOMS
                </h1>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Koregaon Park, Pune, Maharashtra 411001
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>GSTIN: 27AABCJ1234F1Z8 · CIN: U55101MH2021PTC123456</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                  Tax Invoice / Folio Receipt
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedInvoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Date: 05 Oct 2026</div>
              </div>
            </div>

            {/* Guest & Room Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '12.5px' }}>
              <div>
                <strong>Billed To:</strong>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedInvoice.guestName}</div>
                <div>{selectedInvoice.phone}</div>
                <div>{selectedInvoice.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>Room / Suite:</strong>
                <div style={{ color: '#7a0c24', fontWeight: 700, fontSize: '14px' }}>
                  Room {selectedInvoice.room} — {selectedInvoice.suiteName}
                </div>
                <div>Check-in: {selectedInvoice.checkInDate}</div>
                <div>Check-out: {selectedInvoice.checkOutDate}</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="invoice-line-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td style={{ color: '#64748b' }}>{item.category}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Taxes & Total */}
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0' }}>
                <span>Subtotal</span>
                <span>₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0' }}>
                <span>CGST (2.5%)</span>
                <span>₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0' }}>
                <span>SGST (2.5%)</span>
                <span>₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="invoice-total-row">
                <span>Grand Total:</span>
                <span>₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '28px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#7a0c24',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Print / Save PDF (Room {selectedInvoice.room})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '24px', color: '#64748b' }}>Loading folios...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
