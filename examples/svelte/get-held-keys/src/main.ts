import { mount } from 'svelte'
import Root from './Root.svelte'
import './index.css'

mount(Root, { target: document.getElementById('app')! })
