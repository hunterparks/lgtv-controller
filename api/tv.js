const express = require('express');
const lgtv = require('lgtv-ip-control');

const tvService = require('../service/tv');
const { tvIds, tvs } = require('../config');

const router = express.Router();

const validateTvId = (req, _res, next) => {
  const id = req.params.id;
  if (!tvIds.includes(id)) {
    next(new Error(`Invalid TV id: ${id}`));
  }
  next();
};

router.get('/', (_req, res) => {
  res.json({
    message: '📺',
    data: tvData,
  });
});

// Valid Data
router.get('/valid-apps', (_req, res) => {
  res.json({
    message: 'Valid apps',
    data: Object.keys(lgtv.Apps),
  });
});

router.get('/valid-energy-saving-levels', (_req, res) => {
  res.json({
    message: 'Valid energy saving levels',
    data: Object.keys(lgtv.EnergySavingLevels),
  });
});

router.get('/valid-inputs', (_req, res) => {
  res.json({
    message: 'Valid inputs',
    data: Object.keys(lgtv.Inputs),
  });
});

router.get('/valid-keys', (_req, res) => {
  res.json({
    message: 'Valid keys',
    data: Object.keys(lgtv.Keys),
  });
});

router.get('/valid-picture-modes', (_req, res) => {
  res.json({
    message: 'Valid picture modes',
    data: Object.keys(lgtv.PictureModes),
  });
});

router.get('/:id', validateTvId, async (req, res) => {
  const id = req.params.id;
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => ({
    app: await tvService.getTvCurrentApp(tv),
    volume: await tvService.getTvVolume(tv),
    ipControlState: await tvService.getTvIpControlState(tv),
    macAddress: {
      wired: await tvService.getTvMacAddress(tv, 'wired'),
      wifi: await tvService.getTvMacAddress(tv, 'wifi'),
    },
    mute: await tvService.getTvMute(tv),
  }));
  res.json({
    message: `TV ${id} Information`,
    data,
  });
});

// App
router.get('/:id/app', validateTvId, async (req, res) => {
  const id = req.params.id;
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => ({
    app: await tvService.getTvCurrentApp(tv),
  }));
  res.json({
    message: `TV ${id} app`,
    data,
  });
});

router.post('/:id/app', validateTvId, async (_req, _res, next) => {
  next(new Error('Updating app is not implemented'));
});

// Volume
router.get('/:id/volume', validateTvId, async (req, res) => {
  const id = req.params.id;
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => ({
    volume: +(await tvService.getTvVolume(tv)),
  }));
  res.json({
    message: `TV ${id} volume`,
    data,
  });
});

router.post('/:id/volume', validateTvId, async (req, res, next) => {
  const id = req.params.id;
  const rawVolume = req.body.payload.volume;
  const volume = +rawVolume;
  if (!/\d+/g.test(volume) || volume < 0 || volume > 100) {
    return next(
      new Error(
        `Invalid TV volume: ${rawVolume} (parsed ${volume}), must be a value between 0 and 100`
      )
    );
  }
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => {
    await tv.setVolume(volume);
    return {
      volume: +(await tvService.getTvVolume(tv)),
    };
  });
  res.json({
    message: `TV ${id} volume updated`,
    data,
  });
});

// IP Control State
router.get('/:id/ip-control-state', validateTvId, async (req, res) => {
  const id = req.params.id;
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => ({
    ipControlState: await tvService.getTvIpControlState(tv),
  }));
  res.json({
    message: `TV ${id} IP control state`,
    data,
  });
});

// MAC Address
router.get('/:id/mac-address', validateTvId, async (req, res) => {
  const id = req.params.id;
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => ({
    macAddress: {
      wired: await tvService.getTvMacAddress(tv, 'wired'),
      wifi: await tvService.getTvMacAddress(tv, 'wifi'),
    },
  }));
  res.json({
    message: `TV ${id} mac addresses`,
    data,
  });
});

router.get(
  '/:id/mac-address/:interface',
  validateTvId,
  async (req, res, next) => {
    const id = req.params.id;
    const rawInterface = req.params.interface;
    const interface = ['wired', 'wifi'].find((iface) => iface === rawInterface);
    if (!interface) {
      return next(
        new Error(
          `Invalid TV interface: ${rawInterface}, must be 'wired' or 'wifi'`
        )
      );
    }
    const tv = tvService.tvConnections.get(id);
    const data = await tvService.runTransaction(tv, async () => {
      const macAddress = {};
      macAddress[interface] = await tvService.getTvMacAddress(tv, interface);
      return { macAddress };
    });
    res.json({
      message: `TV ${id} ${interface} mac address`,
      data,
    });
  }
);

// Mute
router.get('/:id/mute-state', validateTvId, async (req, res) => {
  const id = req.params.id;
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => ({
    mute: await tvService.getTvMute(tv),
  }));
  res.json({
    message: `TV ${id} mute state`,
    data,
  });
});

router.post('/:id/mute-state', validateTvId, async (req, res, next) => {
  const id = req.params.id;
  const rawMute = req.body.payload.mute;
  const mute = rawMute;
  if (typeof mute !== 'boolean') {
    return next(
      new Error(`Invalid TV mute state: ${rawMute}, must be 'true' or 'false'`)
    );
  }
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => {
    await tv.setVolumeMute(mute);
    return {
      mute: await tvService.getTvMute(tv),
    };
  });
  res.json({
    message: `TV ${id} mute state updated`,
    data,
  });
});

// Power
router.post('/:id/power', validateTvId, async (req, res, next) => {
  const id = req.params.id;
  let rawPower = req.body.payload.power;
  // Handle AHK weirdness
  if (rawPower === 0) {
    rawPower = false;
  }
  const power = rawPower;
  if (typeof power !== 'boolean') {
    return next(
      new Error(`Invalid TV power: ${rawPower}, must be 'true' or 'false'`)
    );
  }
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => {
    if (power) {
      await tv.powerOn();
    } else {
      await tv.powerOff();
    }
    return {
      power: power ? 'on' : 'off',
    };
  });
  res.json({
    message: `TV ${id} power updated`,
    data,
  });
});

// Send Key
router.post('/:id/send-key', validateTvId, async (_req, _res, next) => {
  next(new Error('Sending a key is not implemented'));
});

// Energy Level
router.post('/:id/energy-level', validateTvId, async (req, res, next) => {
  const enabled = false;
  if (!enabled) {
    return next(new Error('Updating energy saving level is not implemented'));
  }
  const validInputs = Object.keys(lgtv.EnergySavingLevels);
  const id = req.params.id;
  const rawEnergyLevel = req.body.payload.energyLevel;
  const energyLevel = validInputs.find((e) => e === rawEnergyLevel);
  if (!energyLevel) {
    return next(
      new Error(
        `Invalid TV energy saving level: ${rawEnergyLevel}, must be in list from '/api/v1/tv/valid-energy-saving-levels'`
      )
    );
  }
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => {
    await tv.setEnergySaving(energyLevel);
    return {
      energyLevel,
    };
  });
  res.json({
    message: `TV ${id} energy saving level updated`,
    data,
  });
});

// Input
router.post('/:id/input', validateTvId, async (req, res, next) => {
  const validInputs = Object.keys(lgtv.Inputs);
  const id = req.params.id;
  const rawInput = req.body.payload.input;
  const input = validInputs.find((i) => i === rawInput);
  if (!input) {
    return next(
      new Error(
        `Invalid TV input: ${rawInput}, must be in list from '/api/v1/tv/valid-inputs'`
      )
    );
  }
  const tv = tvService.tvConnections.get(id);
  const data = await tvService.runTransaction(tv, async () => {
    await tv.setInput(input);
    return {
      app: await tvService.getTvCurrentApp(tv),
    };
  });
  res.json({
    message: `TV ${id} input updated`,
    data,
  });
});

module.exports = router;
