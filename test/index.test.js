import test from 'ava';
import moment from 'moment';
import { lastAskedTimeToStrength, DEFAULT_WEIGHTS } from '../src/cmds/gen/strength';

test('lastAskedTimeToStrength with a lastAskedTime of now up to 1 day ago should give 0 strength', t => {
  var lastAskedTime = moment().subtract(2, 'hours');
  t.is(lastAskedTimeToStrength(lastAskedTime, DEFAULT_WEIGHTS.lastAskedTime), 0);

  var lastAskedTime2 = moment().subtract(1, 'days').add(2, 'hours');
  t.is(lastAskedTimeToStrength(lastAskedTime2, DEFAULT_WEIGHTS.lastAskedTime), 0);
});

test('lastAskedTimeToStrength with a lastAskedTime of 1 day ago up to 2 days ago should give -1 strength', t => {
  t.is(lastAskedTimeToStrength(moment().add(2, 'hours').subtract(2, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -1);
  t.is(lastAskedTimeToStrength(moment().subtract(2, 'hours').subtract(1, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -1);
});

test('lastAskedTimeToStrength with a lastAskedTime of 2 days ago up to 5 days ago should give -2 strength', t => {
  t.is(lastAskedTimeToStrength(moment().add(2, 'hours').subtract(5, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -2);
  t.is(lastAskedTimeToStrength(moment().add(2, 'hours').subtract(3, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -2);
});

test('lastAskedTimeToStrength with a lastAskedTime of 5 days ago up to 10 days go should give -4 strength', t => {
  t.is(lastAskedTimeToStrength(moment().subtract(5, 'days').subtract(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -4);
  t.is(lastAskedTimeToStrength(moment().subtract(10, 'days').add(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -4);
});

test('lastAskedTimeToStrength with a lastAskedTime of 10 days ago up to 20 days go should give -6 strength', t => {
  t.is(lastAskedTimeToStrength(moment().subtract(10, 'days').subtract(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -6);
  t.is(lastAskedTimeToStrength(moment().subtract(20, 'days').add(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -6);
});

test('lastAskedTimeToStrength with a lastAskedTime of 20 days ago up to 30 days go should give -8 strength', t => {
  t.is(lastAskedTimeToStrength(moment().subtract(20, 'days').subtract(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -8);
  t.is(lastAskedTimeToStrength(moment().subtract(30, 'days').add(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -8);
});

test('lastAskedTimeToStrength with a lastAskedTime of 30 days ago up to 60 days go should give -15 strength', t => {
  t.is(lastAskedTimeToStrength(moment().subtract(30, 'days').subtract(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -15);
  t.is(lastAskedTimeToStrength(moment().subtract(60, 'days').add(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -15);
});

test('lastAskedTimeToStrength with a lastAskedTime of more than 60 days go should give -17 strength', t => {
  t.is(lastAskedTimeToStrength(moment().subtract(60, 'days').subtract(2, 'hours'), DEFAULT_WEIGHTS.lastAskedTime), -17);
  t.is(lastAskedTimeToStrength(moment().subtract(80, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -17);
  t.is(lastAskedTimeToStrength(moment().subtract(280, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -17);
  t.is(lastAskedTimeToStrength(moment().subtract(1680, 'days'), DEFAULT_WEIGHTS.lastAskedTime), -17);
});
