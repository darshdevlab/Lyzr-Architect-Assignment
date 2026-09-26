import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement, Children, type ReactElement } from 'react';
import { readOnlyControls } from '../src/components/ReadOnlyControls.ts';
function controls(readonly: boolean) {
  return Children.toArray(
    readOnlyControls(
      [
        createElement('button', { key: 'save' }, 'Save documents'),
        createElement('button', { key: 'download' }, 'Download source'),
        createElement('button', { key: 'open' }, 'Open agent canvas'),
        createElement('textarea', { key: 'draft', value: 'safe', onChange: () => {} }),
        createElement('input', {
          key: 'search',
          'aria-label': 'Search workflows',
          onChange: () => {},
        }),
        createElement('button', { key: 'code' }, 'Code'),
      ],
      readonly,
    ),
  ) as ReactElement<any>[];
}
test('viewer controls disable mutations while retaining inspection, exports and search', () => {
  const x = controls(true);
  assert.equal(x[0].props.disabled, true);
  assert.notEqual(x[1].props.disabled, true);
  assert.notEqual(x[2].props.disabled, true);
  assert.equal(x[3].props.readOnly, true);
  assert.equal(x[3].props.onChange, undefined);
  assert.equal(typeof x[4].props.onChange, 'function');
  assert.notEqual(x[5].props.disabled, true);
});
test('editable controls are unchanged for authorized contributors', () => {
  const x = controls(false);
  assert.equal(x[0].props.disabled, undefined);
  assert.equal(typeof x[3].props.onChange, 'function');
});
test('nested component boundaries receive viewer state', () => {
  function Panel() {
    return null;
  }
  const x = Children.toArray(readOnlyControls(createElement(Panel), true)) as ReactElement<any>[];
  assert.equal(x[0].props.readOnly, true);
});
