/// <reference types="@wdio/globals/types" />
/// <reference types="../../src/shims-vue" />
import { browser, $ } from '@wdio/globals'
import { Key } from 'webdriverio'

import { createApp } from 'vue';
import VueClickAway from 'vue3-click-away';

import { createPinia } from '../../src/store';
import { router } from '../../src/router/index';

import App from '../../src/App.vue';
import '../../src/index.css';

/**
 * custom selector fetch cards by containing text
 */
await browser.addLocatorStrategy('cardsWithValue', (selector, root) => {
  const rootNode = root || document.body
  return [...rootNode.querySelectorAll('div')].filter(
    (div) => div.children.length === 0 && div.innerText && div.innerText.includes(selector || ''))
})

/**
 * This test file showcases use of several selector strategies used in WebdriverIO.
 * 
 * Why using accessibility selectors over other types of selectors?
 *   - Make selectors in test scripts more resilient to source code changes.
 *   - Make test scripts more readable (accessible names are semantic descriptors).
 *   - Motivate good practices for assigning accessibility properties to elements.
 */

describe('Trello Application', () => {
  before(() => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    const pinia = createPinia();
    createApp(App).use(pinia).use(VueClickAway).use(router).mount(container)
  })

  it('can create an initial board', async () => {
    await $('aria/Name of your first board').setValue('Let the Engineers Speak')
    await browser.keys(Key.Enter)
    await expect(browser).toHaveUrlContaining('/board/1')
  })

  it('can add a list on the board', async () => {
    await $('aria/Enter list title...').setValue('Talking Points')
    await $('aria/Add list').click()

    /**
     * Select element by JS function as it is much more perfomant this way
     * (1 roundtrip vs nth roundtrips)
     */
    await expect($(() => (
      [...document.querySelectorAll('input')]
        .find((input) => input.value === 'Talking Points')
    ))).toBePresent()
  })

  it('can add a card to the list', async () => {
    await $('aria/Add another card').click()
    await $('aria/Enter a title for this card...').addValue('Selectors')
    await browser.keys(Key.Enter)
    await expect($$('div[data-cy="card"]')).toBeElementsArrayOfSize(1)
    await $('aria/Enter a title for this card...').addValue('Shadow DOM')
    await browser.keys(Key.Enter)
    await $('aria/Enter a title for this card...').addValue('Visual Testing')
    await browser.keys(Key.Enter)
    await expect($$('div[data-cy="card"]')).toBeElementsArrayOfSize(3)

    /**
     * use a custom selector registered at the top of the file
     * this finds all cards containing an `o` character
     */
    expect(await browser.custom$$('cardsWithValue', 'o').length).toBe(2)
  })

  it('can close adding more cards', async () => {
    await $('aria/Add card').nextElement().click()
    await expect($('aria/Add card')).not.toBePresent()
  })

  it('can star the board', async () => {
    const startBtn = $('aria/Let the Engineers Speak').parentElement().nextElement()
    await startBtn.click()
    await expect(startBtn).toHaveStyle({ color: 'rgba(253,224,71,1)' })
  })

  it('can delete a board', async () => {
    await $('aria/Let the Engineers Speak').parentElement().nextElement().nextElement().click()
    await $('aria/Delete board').click()

    await $('aria/Log in').click()
    await $('nav button').click()

    await expect($('aria/Get started!')).toBePresent()
  })

  it('can find links with partial or full text selector', async () => {
    const linkText = '...powered by coffee and love ❤️  Filip Hric'
    await expect($(`=${linkText}`)).toHaveText(linkText)
    await expect($('*=coffee and love')).toHaveText(linkText)
  })
})