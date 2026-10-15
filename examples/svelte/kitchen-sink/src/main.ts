import { mount } from 'svelte'
import Root from './Root.svelte'
import './styles.css'

mount(Root, { target: document.getElementById('app')! })
