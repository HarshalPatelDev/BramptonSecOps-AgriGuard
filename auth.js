const signInTab = document.querySelector('#signin-tab');
const signUpTab = document.querySelector('#signup-tab');
const signInPanel = document.querySelector('#signin-panel');
const signUpPanel = document.querySelector('#signup-panel');
const heading = document.querySelector('#auth-heading');
const description = document.querySelector('#auth-description');
const feedback = document.querySelector('#auth-feedback');

function setAuthMode(mode) {
  const isSignUp = mode === 'signup';
  signInTab.classList.toggle('active', !isSignUp);
  signUpTab.classList.toggle('active', isSignUp);
  signInTab.setAttribute('aria-selected', String(!isSignUp));
  signUpTab.setAttribute('aria-selected', String(isSignUp));
  signInTab.tabIndex = isSignUp ? -1 : 0;
  signUpTab.tabIndex = isSignUp ? 0 : -1;
  signInPanel.hidden = isSignUp;
  signUpPanel.hidden = !isSignUp;
  heading.textContent = isSignUp ? 'Create your account.' : 'Welcome back.';
  description.textContent = isSignUp
    ? 'Set up a workspace for your business.'
    : 'Sign in to continue to your business risk planner.';
  feedback.hidden = true;
  history.replaceState(null, '', isSignUp ? '#signup' : '#signin');
}

signInTab.addEventListener('click', () => setAuthMode('signin'));
signUpTab.addEventListener('click', () => setAuthMode('signup'));
document.querySelectorAll('.auth-mode-button').forEach((tab, index, tabs) => {
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  });
});

document.querySelectorAll('[data-toggle-password]').forEach(button => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    button.textContent = reveal ? 'Hide' : 'Show';
    button.setAttribute('aria-label', `${reveal ? 'Hide' : 'Show'} password`);
  });
});

document.querySelectorAll('.auth-form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    feedback.textContent = 'Authentication is not connected in this prototype. No account was created and your information was not saved.';
    feedback.hidden = false;
  });
});

document.querySelector('#password-help-link').addEventListener('click', event => {
  event.preventDefault();
  feedback.textContent = 'Password recovery will be available after a secure authentication service is connected.';
  feedback.hidden = false;
});

setAuthMode(window.location.hash === '#signup' ? 'signup' : 'signin');
