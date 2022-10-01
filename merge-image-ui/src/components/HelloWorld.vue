<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div class="image-container">
      <div v-for="(img, index) in imageDataUris" :key="index" class="item">
        <img :src="img" alt="">
        <i @click="removeImage(index)">X</i>
      </div>
    </div>
    <div>
      <input ref="fileInput" @change="onPickFile($event)" class="icon-ion-android-attach" type="file"
             accept="image/png, image/jpeg"
             multiple
             alt="choose image">
      <button v-if="images.length && !this.mergedImgUrl" :disabled="uploading" @click="upload">合并</button>
      <a v-if="mergedImgUrl" :href="mergedImgUrl" download target="_blank">下载</a>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      images: [],
      imageDataUris: [],
      mergedImgUrl: '',
      uploading: false,
    }
  },
  methods: {
    onPickFile(event) {
      for (let i = 0; i < event.target.files.length; i++) {
        let img = event.target.files[i];

        this.images.push(img)
        this.imageDataUris.push(URL.createObjectURL(img))
      }
      this.mergedImgUrl = null;
    },
    removeImage(index) {
      this.images.splice(index, 1);
      this.imageDataUris.splice(index, 1)
      this.mergedImgUrl = null;
    },
    upload() {
      this.uploading = true;
      let formData = new FormData();
      this.images.forEach(img => {
        formData.append("photos", img);
      })
      axios.post('/upload-photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(res => {
        this.mergedImgUrl = res.data.data
        console.log('res', res.data)
      }).finally(() => {
        this.uploading = false;
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

.image-container {
  display: flex;
  flex-direction: row;
}

.image-container .item {
  width: 100px;
  height: 100px;
  margin: 10px;
  position: relative;
}

.image-container .item img {
  width: 100%;
  height: 100%;
}

.image-container .item i {
  position: absolute;
  right: 0;
  top: 0;
  padding: 10px;
}

.image-container .item i:hover {
  color: red;
}

</style>
