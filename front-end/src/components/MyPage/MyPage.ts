import { getUserInfo } from '@/apis/mypage';
import Component from '@/core/Component';
import { qs } from '@/utils/querySelector';
import { literal } from './template';
import styles from './MyPage.module.scss';
import { loadscript } from '@/utils/googleAPI';
import { carList } from '@/constants/carList';

interface IAppointment {
  date: string;
  id: number;
  status: string;
}

interface IOptions {
  category: string;
  name: string;
}

interface ILocation {
  latitude: string;
  longitude: string;
}

interface ISharing {
  appointments: IAppointment[];
  post: {
    carName: string;
    id: number;
    location: ILocation;
    options: IOptions[];
    requirement: string;
    rideOption: string;
  };
}

interface IDriving {
  date: string;
  post: {
    carName: string;
    id: number;
    location: ILocation;
    options: IOptions[];
    requirement: string;
    rideOption: string;
  };
}

interface IUser {
  createdAt: string;
  drivingCount: number;
  email: string;
  phoneNumber: string;
  sharingCount: number;
  userName: string;
}

export class MyPage extends Component {
  setup() {
    getUserInfo()
      .then((res) => {
        this.setState({ res });
      })
      .catch((err) => console.log(err));
    this.init();
  }

  template(): string {
    return literal();
  }

  init() {
    loadscript(
      `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_API_KEY}&callback=initMap`,
      function doNothing() {}
    );
  }

  mounted(): void {
    const shareCardWrapper = qs(`#${'share-card'}`);
    const expCardWrapper = qs(`#${'exp-card'}`);

    const drivingList = this.state.res.data.driving as IDriving[];
    const sharingList = this.state.res.data.sharing as ISharing[];
    const user = this.state.res.data.user as IUser;

    console.log(this.state.res.data);
    this.setUserInfo(user);
    drivingList?.forEach((element: IDriving) => {
      expCardWrapper!.innerHTML += this.generateDrivingCard(element);
    });
    sharingList.forEach((element: ISharing) => {
      shareCardWrapper!.innerHTML += this.generateSharingCard(element);
    });
  }

  async reverseGeocode(latlng: object) {
    const LatLng = latlng as google.maps.LatLng;
    const geocoder = new google.maps.Geocoder();
    let content = '';
    geocoder.geocode({ location: LatLng }, (response) => {
      content = response[0].formatted_address;
    });
    return content;
  }

  setUserInfo(user: IUser) {
    const userInfo = qs(`.${styles['user-info']}`) as HTMLDivElement;
    const $name = qs(`.${styles['user-name']}`, userInfo) as HTMLDivElement;
    $name.innerText = user.userName;
    const $date = qs(`.${styles['user-date']}`, userInfo) as HTMLDivElement;
    $date.innerText = user.createdAt;
    const $email = qs(`.${styles['user-email']}`, userInfo) as HTMLDivElement;
    $email.innerText = user.email;
    const $expno = qs(`.${styles['user-exp']}`, userInfo) as HTMLDivElement;
    $expno.innerText = user.drivingCount as unknown as string;
    const $shrno = qs(`.${styles['user-share']}`, userInfo) as HTMLDivElement;
    $shrno.innerText = user.sharingCount as unknown as string;
  }

  findCarImage(carName: string) {
    const matched = carList.filter((car) => car.fileName.includes(carName));
    return matched.length === 0 ? null : matched[0].fileName;
  }

  generateDrivingCard(data: IDriving): string {
    const carName = data.post.carName.toLowerCase();
    const carImage = this.findCarImage(carName);
    const options = data.post.options;
    const date = data.date;
    const lat = +data.post.location.latitude;
    const lng = +data.post.location.longitude;
    const loc = {
      lat: lat,
      lng: lng,
    };
    debugger;
    const location = this.reverseGeocode(loc);
    return `
    <div class="${styles['card-wrapper']}">
      <div class=${styles['image-wrapper']}>
        <div class="${styles['helper']}"></div>
        <img class="${styles['image']}" src="${
      process.env.VITE_IMAGE_URL
    }/${carImage}" />
      </div>
      <div class="${styles['text-wrapper']}">
        <div class="${styles['helper']}"></div>
        <div class="${styles['car-name']}">${carName}</div>
        <div class="${styles['options']}">${options.map(
      (ele) => ele.name
    )}</div>
        <div class="${styles['date']}">${date}</div>
        <div class="${styles['location']}">${location}</div>
      </div>
    </div>
    `;
  }

  generateSharingCard(data: ISharing): string {
    const carName = data.post.carName.toLowerCase();
    const carImage = this.findCarImage(carName);
    const options = data.post.options;
    const lat = +data.post.location.latitude;
    const lng = +data.post.location.longitude;
    const loc = {
      lat: lat,
      lng: lng,
    };
    const location = this.reverseGeocode(loc);
    // const appointment = data.appointments;
    // <div class="${styles['date']}">${appointment[0].date}</div>
    // 이거는 고민 좀 해봐야할 듯
    return `
    <div class=${styles['card-wrapper']}>
      <div class=${styles['image-wrapper']}>
        <div class=${styles['helper']}></div>
        <img class="${styles['image']}" src="${
      process.env.VITE_IMAGE_URL
    }/${carImage}" />
      </div>
      <div class="${styles['text-wrapper']}">
        <div class="${styles['helper']}"></div>
        <div class="${styles['car-name']}">${carName}</div>
        <div class="${styles['options']}">${options.map(
      (ele) => ele.name
    )}</div>
        
        <div class="${styles['location']}">${location}</div>
      </div>
    </div>
    `;
  }
}
