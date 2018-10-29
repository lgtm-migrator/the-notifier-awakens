import React, { Component } from 'react';
import Style from 'style-it';
import { get } from 'object-path';

import './App.css';

import { APIService } from './services';
import { ComponentController } from './controllers';
import {
  defaultApis,
  defaultAffiliationSettings,
  defaultSettings,
  defaultTranslations,
  styles,
} from './defaults';
import { DEBUG } from './constants';

class App extends Component {
  constructor() {
    super();
    const { affiliation = 'debug' } = defaultSettings;
    const {
      components = [],
      layouts = [],
      style = 'online',
    } = defaultAffiliationSettings[affiliation];

    this.updateData = this.updateData.bind(this);

    this.APIService = new APIService(
      defaultApis,
      this.updateData,
      defaultSettings,
      components,
    );
    this.ComponentController = new ComponentController(
      components,
      defaultSettings,
      defaultTranslations,
    );

    this.state = {
      data: {},
      components,
      layouts,
      style,
      settings: defaultSettings,
    };

    this.startAPIs();
  }

  updateData(key, data) {
    this.ComponentController.update(key, data);
    const newData = Object.assign({}, this.state.data, {
      [key]: data,
    });
    this.setState(
      Object.assign({}, this.state, {
        data: newData,
      }),
    );
  }

  updateSettings(settings) {
    this.APIService.updateSettings(settings);
    this.ComponentController.updateSettings(settings);
    this.setState(
      Object.assign({}, this.state, {
        settings,
      }),
    );
  }

  startAPIs() {
    this.APIService.start();
  }
  stopAPIs() {
    this.APIService.stop();
  }
  updateAPIs() {
    this.APIService.update();
  }

  /**
   * Get a CSS grid-template value from layout array.
   * 
   * Examples:
```javascript
getGridTemplateFromLayoutArray(['a b', 'a b']) => '"a b" "a b" / 1fr 1fr'
getGridTemplateFromLayoutArray(['a a', '. b b']) => '"a a ." ". b b" / 1fr 1fr 1fr'
getGridTemplateFromLayoutArray(['a', 'a b b']) => '"a . ." "a b b" / 1fr 1fr 1fr'
```
   * 
   * @param {array} layout Array with placed components.
   * 
   * @returns {string} A string for grid-template.
   */
  getGridTemplateFromLayoutArray(layout) {
    const cols = layout.reduce(
      (acc, row) => Math.max(acc, row.split(' ').length),
      0,
    );
    const wrappedInQuotes = layout
      .map(
        e =>
          `"${e + ' .'.repeat((cols - (e.split(' ').length % cols)) % cols)}"`,
      )
      .join(' ');

    return `${wrappedInQuotes} /${' 1fr'.repeat(cols)}`;
  }

  /**
   * Make it possible to input a list of components and get
   * a grid-template which wraps to correct size.
   * 
   * Examples:
```javascript
const components = [
  { template: 'Bus' },
  { template: 'Clock' },
  { template: 'Office' },
]

generateDefaultGridTemplateFromComponents(components, 1) => ['Bus', 'Clock', 'Office']
generateDefaultGridTemplateFromComponents(components, 2) => ['Bus Clock', 'Office .']
generateDefaultGridTemplateFromComponents(components, 3) => ['Bus Clock Office']
```
   * @param {array} components List of components in view.
   * @param {number} width When to wrap.
   * 
   * @returns {array} A grid-template value.
   */
  generateDefaultGridTemplateFromComponents(components, width = 1) {
    let gridTemplate = [];
    const count = components.length;
    let lastIndex = -1;
    for (let i = 0; i < count; i += width) {
      gridTemplate.push(
        components
          .slice(i, i + width)
          .map(component => `${component.id || component.template}`)
          .join(' '),
      );
      lastIndex++;
    }
    gridTemplate[lastIndex] += ' .'.repeat((width - (count % width)) % width);

    return gridTemplate;
  }

  render() {
    const componentsRendered = this.ComponentController.renderComponents(
      this.state.data,
    );

    let mobileLayout = get(this.state, 'layouts.0', []);
    let tabletLayout = get(this.state, 'layouts.1', []);
    let desktopLayout = get(this.state, 'layouts.2', []);

    if (!mobileLayout.length) {
      mobileLayout = this.generateDefaultGridTemplateFromComponents(
        this.state.components,
        1,
      );
    }

    if (!tabletLayout.length) {
      tabletLayout = this.generateDefaultGridTemplateFromComponents(
        this.state.components,
        2,
      );
    }

    if (!desktopLayout.length) {
      desktopLayout = this.generateDefaultGridTemplateFromComponents(
        this.state.components,
        3,
      );
    }

    let globalCSS = `
.component {
  ${DEBUG ? 'border: 1px solid rgba(255, 0, 0, .5);' : ''}
}

.component-container {
  grid-template: ${this.getGridTemplateFromLayoutArray(mobileLayout)};
}

@media (min-width: 512px) {
  .component-container {
    grid-template: ${this.getGridTemplateFromLayoutArray(tabletLayout)};
  }
}

@media (min-width: 1024px) {
  .component-container {
    grid-template: ${this.getGridTemplateFromLayoutArray(desktopLayout)};
  }
}
`;
    if (this.state.settings.style in styles) {
      globalCSS += styles[this.state.settings.style];
    } else {
      if (this.state.style in styles) {
        globalCSS += styles[this.state.style];
      } else {
        if (this.state.settings.affiliation in styles) {
          globalCSS += styles[this.state.settings.affiliation];
        }
      }
    }

    return (
      <Style>
        {globalCSS}
        <div className="App">
          <div className="component-container">{componentsRendered}</div>
        </div>
      </Style>
    );
  }
}

export default App;
