import { common } from './common';
import { dates } from './dates';
import { actionNames } from './actionNames';
import { domain } from './domain';
import { navigation } from './navigation';
import { auth } from './auth';
import { home } from './home';
import { day } from './day';
import { actions } from './actions';
import { settings } from './settings';
import { drivingHours } from './drivingHours';
import { worksheet } from './worksheet';
import { map } from './map';
import { photo } from './photo';
import { passwordReset } from './passwordReset';

import type { pt } from '../pt';

/** Dicionário espanhol (Espanha). Tem de ter a mesma forma do português. */
export const es: typeof pt = { common, dates, actionNames, domain, navigation, auth, home, day, actions, settings, drivingHours, worksheet, map, photo, passwordReset };
