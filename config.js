const tvs = new Map();

tvs.set('office', {
  id: 'office',
  keyCode: process.env.OFFICE_TV_KEYCODE,
  ip: process.env.OFFICE_TV_IP,
  mac: process.env.OFFICE_TV_MAC,
});

module.exports = {
  tvs,
  tvIds: Array.from(tvs.keys()),
};
