import { sendLogInRequest, sendRegisterRequest } from '@/apis/login';
import Component from '@/core/Component';
import { qs } from '@/utils/querySelector';
import styles from './LoginForm.module.scss';
export class LoginForm extends Component {
  template(): string {
    return `
        <div class="${styles.container}" id="container">
            <div class="${styles['form-container']} ${styles['sign-up-container']}">
                <form id="signup-form" >
                    <h1>Create Account</h1>                 
                    <span>or use your email for registration</span>
                    <input id="signup-email" type="email" placeholder="Email" />
                    <input id="signup-tel" type="tel" placeholder="010-1234-5678" />
                    <input id="signup-name" type="text" placeholder="홍길동" />
                    <input id="signup-pwd" type="password" placeholder="Password" />
                    <button id="sign-up-button">Sign Up</button>
                    
                </form>
            </div>
            <div class="${styles['form-container']} ${styles['sign-in-container']}">
                <form id="signin-form">
                    <h1>Sign in</h1>
                    <div class="${styles['social-container']}">
                        <a href="#" class="${styles.social}"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="${styles.social}"><i class="fab fa-google-plus-g"></i></a>
                        <a href="#" class="${styles.social}"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                    <span>or use your account</span>
                    <input id="signin-email" type="email" placeholder="Email" />
                    <input id="signin-pwd" type="password" placeholder="Password" />
                    <a  id="api-test">Forgot your password?</a>
                    <button id="sign-in-button">Sign In</button>
                    
                </form>
            </div>
            <div class="${styles['overlay-container']}">
                <div class="${styles.overlay}">
                    <div class="${styles['overlay-panel']} ${styles['overlay-left']}">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button class="${styles.ghost}" id="signIn">Sign In</button>
                    </div>
                    <div class="${styles['overlay-panel']} ${styles['overlay-right']}">
                        <h1>Hello, Friend!</h1>
                        <p>Enter your personal details and start journey with us</p>
                        <button class="${styles.ghost}" id="signUp">Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
        `;
  }
  setEvent(): void {
    this.addEvent('click', '#signUp', () => {
      const $container = qs('#container', this.target);
      $container?.classList.add(styles['right-panel-active']);
    });

    this.addEvent('click', '#signIn', () => {
      const $container = qs('#container', this.target);
      $container?.classList.remove(styles['right-panel-active']);
    });

    this.addEvent('click', '#sign-in-button', (e) => {
      e.preventDefault();
      const $button = e.target as HTMLButtonElement;
      const $email = qs('#signin-email', this.target) as HTMLInputElement;
      const $password = qs('#signin-pwd', this.target) as HTMLInputElement;
      const enteredEmail = $email.value;
      const enteredPassword = $password.value;

      this.resetErrorClass($email, $password);
      if (!enteredEmail || !enteredPassword) {
        this.addErrorClass($email, $password);
        return;
      }
      const loadingSpinnerHandler = new LoadingSpinnerHandler($button);
      loadingSpinnerHandler.startRequest();

      sendLogInRequest(enteredEmail, enteredPassword)
        .then(({ data }) => {
          localStorage.setItem('accessToken', data.accessToken);
          location.reload();
        })
        .catch((err) => {
          if (err.response.status === 401) {
            this.resetErrorClass($email, $password);
            this.addErrorClass($email, $password);
            loadingSpinnerHandler.finishRequest();
          }
        });
    });

    this.addEvent('click', '#sign-up-button', (e) => {
      e.preventDefault();

      const $button = e.target as HTMLButtonElement;
      const $email = qs('#signup-email', this.target) as HTMLInputElement;
      const $tel = qs('#signup-tel', this.target) as HTMLInputElement;
      const $name = qs('#signup-name', this.target) as HTMLInputElement;
      const $password = qs('#signup-pwd', this.target) as HTMLInputElement;

      const email = $email.value;
      const phoneNumber = $tel.value;
      const userName = $name.value;
      const userPassword = $password.value;

      this.resetErrorClass($email, $password, $tel, $name);
      if (!email || !phoneNumber || !userName || !userPassword) {
        this.addErrorClass($email, $password, $tel, $name);
        return;
      }
      const loadingSpinnerHandler = new LoadingSpinnerHandler($button);
      loadingSpinnerHandler.startRequest();

      sendRegisterRequest({
        email,
        phoneNumber,
        userName,
        userPassword,
      })
        .then(() => {
          loadingSpinnerHandler.finishRegister();
        })
        .catch(() => {
          this.resetErrorClass($email, $password, $tel, $name);
          this.addErrorClass($email, $password, $tel, $name);
          loadingSpinnerHandler.finishRequest();
        });
    });
  }

  addErrorClass(...$target: HTMLInputElement[]) {
    Array.from($target).forEach((ele) => {
      ele.classList.add(styles.error);
    });
  }

  resetErrorClass(...$target: HTMLInputElement[]) {
    Array.from($target).forEach((ele) => {
      ele.classList.remove(styles.error);
    });
    void $target[0]?.offsetWidth;
  }
}

class LoadingSpinnerHandler {
  #loadingSpinner = '<div class="loader"></div>';
  #target;
  #targetContent;

  constructor($target: Element) {
    this.#target = $target;
    this.#targetContent = this.#target.innerHTML;
  }
  startRequest() {
    if (this.#target instanceof HTMLButtonElement) {
      this.#target.disabled = true;
    }
    this.#target.innerHTML = this.#loadingSpinner;
  }
  finishRequest() {
    if (this.#target instanceof HTMLButtonElement) {
      this.#target.disabled = false;
    }
    this.#target.innerHTML = this.#targetContent;
  }
  finishRegister() {
    if (this.#target instanceof HTMLButtonElement) {
      this.#target.disabled = true;
    }
    this.#target.innerHTML = '가입 완료!';
  }
}
