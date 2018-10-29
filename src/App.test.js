import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('get correct grid-template value', () => {
  const app = new App();
  expect(app.getGridTemplateFromLayoutArray(['a b', 'a b'])).toEqual(
    '"a b" "a b" / 1fr 1fr',
  );
  expect(app.getGridTemplateFromLayoutArray(['a a', '. b b'])).toEqual(
    '"a a ." ". b b" / 1fr 1fr 1fr',
  );
  expect(app.getGridTemplateFromLayoutArray(['a', 'a b b'])).toEqual(
    '"a . ." "a b b" / 1fr 1fr 1fr',
  );
});

it('get correct default grid-template from components', () => {
  const app = new App();

  const components = [
    { template: 'Bus' },
    { template: 'Clock' },
    { template: 'Office' },
  ];

  expect(app.generateDefaultGridTemplateFromComponents(components, 1)).toEqual([
    'Bus',
    'Clock',
    'Office',
  ]);
  expect(app.generateDefaultGridTemplateFromComponents(components, 2)).toEqual([
    'Bus Clock',
    'Office .',
  ]);
  expect(app.generateDefaultGridTemplateFromComponents(components, 3)).toEqual([
    'Bus Clock Office',
  ]);
});
