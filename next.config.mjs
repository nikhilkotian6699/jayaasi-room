/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:hotelSlug/:roomId/shoecare',
        destination: '/:hotelSlug/:roomId/shoe-care',
      },
      {
        source: '/:hotelSlug/:roomId/shoe',
        destination: '/:hotelSlug/:roomId/shoe-care',
      },
      {
        source: '/:hotelSlug/:roomId/luggage-service',
        destination: '/:hotelSlug/:roomId/luggage',
      },
      {
        source: '/:hotelSlug/:roomId/luggageservice',
        destination: '/:hotelSlug/:roomId/luggage',
      },
      {
        source: '/:hotelSlug/:roomId/service-cart',
        destination: '/:hotelSlug/:roomId/cart',
      },
      {
        source: '/:hotelSlug/:roomId/servicecart',
        destination: '/:hotelSlug/:roomId/cart',
      },
      {
        source: '/:hotelSlug/:roomId/service-cart-pop-up-down',
        destination: '/:hotelSlug/:roomId/cart',
      },
      {
        source: '/:hotelSlug/:roomId/guest-login',
        destination: '/:hotelSlug/:roomId/login',
      },
      {
        source: '/:hotelSlug/:roomId/guestlogin',
        destination: '/:hotelSlug/:roomId/login',
      },
      {
        source: '/:hotelSlug/:roomId/cart',
        destination: '/:hotelSlug/:roomId/cart',
      },
      {
        source: '/guest-login',
        destination: '/jayaasi-rooms/204/login',
      },
      {
        source: '/login',
        destination: '/jayaasi-rooms/204/login',
      },
      {
        source: '/food',
        destination: '/jayaasi-rooms/204/food',
      },
      {
        source: '/services',
        destination: '/jayaasi-rooms/204/services',
      },
      {
        source: '/housekeeping',
        destination: '/jayaasi-rooms/204/housekeeping',
      },
      {
        source: '/luggage',
        destination: '/jayaasi-rooms/204/luggage',
      },
      {
        source: '/shoe-care',
        destination: '/jayaasi-rooms/204/shoe-care',
      },
      {
        source: '/laundry',
        destination: '/jayaasi-rooms/204/laundry',
      },
      {
        source: '/cart',
        destination: '/jayaasi-rooms/204/cart',
      },
      {
        source: '/travel',
        destination: '/jayaasi-rooms/204/travel',
      },
      {
        source: '/room-info',
        destination: '/jayaasi-rooms/204/room-info',
      },
      {
        source: '/orders',
        destination: '/jayaasi-rooms/204/orders',
      },
    ];
  },
};

export default nextConfig;
