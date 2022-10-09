const { LGTV } = require('lgtv-ip-control');

const { tvs } = require('../config');

// Private
const scc = (rawString) => stripControlCharacters(rawString);
const stripControlCharacters = (rawString) =>
  rawString.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

// Public
const tvConnections = new Map();
for ([_, tv] of tvs) {
  tvConnections.set(tv.id, new LGTV(tv.ip, tv.mac, tv.keyCode));
}

const getTvCurrentApp = async (tv) =>
  scc(await tv.getCurrentApp()).replace('APP:', '');

const getTvVolume = async (tv) =>
  scc(await tv.getCurrentVolume()).replace('VOL:', '');

const getTvIpControlState = async (tv) => scc(await tv.getIpControlState());

const getTvMacAddress = async (tv, interface) => {
  if (!['wired', 'wifi'].includes(interface)) {
    return `Invalid interface '${interface}'`;
  }
  return scc(await tv.getMacAddress(interface));
};

const getTvMute = async (tv) =>
  scc(await tv.getMuteState()).replace('MUTE:', '');

const runTransaction = async (tv, callback) => {
  await tv.connect();
  const data = await callback();
  await tv.disconnect();
  return data;
};

module.exports = {
  tvConnections,
  getTvCurrentApp,
  getTvVolume,
  getTvIpControlState,
  getTvMacAddress,
  getTvMute,
  runTransaction,
};
