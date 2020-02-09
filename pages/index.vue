<template>
  <v-layout column justify-center align-center>
    <v-flex style="width: 400px;" xs12 sm8 md6>
      <v-form v-model="valid">
        <v-card class="mb-5">
          <v-card-title>
            Lets build a link!
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="linkType"
              :items="linkTypes"
              label="Select the link target"
              :rules="required"
            ></v-select>
          </v-card-text>
        </v-card>

        <div v-if="sections[linkType]">
          <v-card class="mb-5" v-if="sections[linkType].path">
            <v-card-title>
              Library path
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="libraryPath"
                :items="libraryPaths"
                label="Select the library path*"
                :rules="required"
              ></v-select>

              <div v-if="libraryPath == 'details'">
                <v-select
                  v-model="contentType"
                  :items="['', 'course', 'single']"
                  label="Content type*"
                  :rules="required"
                ></v-select>

                <v-text-field
                  v-model="contentIdentifier"
                  label="Content identifier*"
                  :rules="required"
                ></v-text-field>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mb-5" v-if="sections[linkType].storeParameters">
            <v-card-title>
              Store parameters
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="storePackage"
                :items="storePackages"
                label="Select a package*"
                :rules="required"
              ></v-select>
              <v-text-field
                v-model="storeUserIdentifier"
                label="User identifier*"
                :rules="required"
              ></v-text-field>
              <v-text-field v-model="storeCoupon" label="Coupon"></v-text-field>
            </v-card-text>
          </v-card>

          <v-card class="mb-5" v-if="sections[linkType].couponCode">
            <v-card-title>
              Coupon code
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="couponCode"
                label="Coupon code"
              ></v-text-field>
            </v-card-text>
          </v-card>

          <v-card class="mb-5" v-if="sections[linkType].webParameters">
            <v-card-title>
              Tracking parameters
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="tracking.utm_campaign"
                :items="utmConfig.utm_campaigns"
                label="utm_campaign"
              ></v-select>
              <v-select
                v-if="sections[linkType].utmSourceParameterRequired"
                v-model="tracking.utm_source"
                :items="utmConfig.utm_sources"
                label="utm_source*"
                :rules="required"
              ></v-select>
              <v-select
                v-else
                v-model="tracking.utm_source"
                :items="utmConfig.utm_sources"
                label="utm_source"
              ></v-select>
              <v-select
                v-model="tracking.utm_medium"
                :items="utmConfig.utm_mediums"
                label="utm_source"
              ></v-select>
              <v-select
                v-model="tracking.utm_term"
                :items="utmConfig.utm_terms"
                label="utm_term"
              ></v-select>
              <v-select
                v-model="tracking.utm_content"
                :items="utmConfig.utm_contents"
                label="utm_content"
              ></v-select>
            </v-card-text>
          </v-card>

          <v-card class="mb-5" v-if="sections[linkType].clickTracker">
            <v-card-text>
              <v-checkbox
                v-model="useClickTracker"
                label="Wrap result in a 7mind link tracker link?"
              ></v-checkbox>
            </v-card-text>
          </v-card>
        </div>
      </v-form>
      <v-card class="mb-5">
        <v-card-title>
          Link:
        </v-card-title>
        <v-card-text>
          <div v-if="!valid">Fill all required fields to get the the link</div>
          <a v-else target="_blank" :href="finalUrl">{{ finalUrl }}</a>
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="valid" color="primary" @click="copy">Copy link</v-btn>
          <v-btn v-if="linkType" @click="reset">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import storePackages from "./storepackages";
import _ from "lodash";
import * as utmConfig from "./utmconfig";
import {
  getUniversalLink,
  getAndroidLink,
  getClickTrackerLink,
  buildUrl
} from "./urlhelpers";

export default {
  methods: {
    reset() {
      Object.assign(this.$data, this.$options.data.call(this));
    },
    copy() {
      this.$copyText(this.finalUrl);
    }
  },
  data() {
    return {
      utmConfig,
      required: [v => !!v || "The is required!"],
      valid: false,
      tracking: {},
      useClickTracker: false,
      contentIdentifier: null,
      contentType: null,
      storeCoupon: null,
      couponCode: null,
      storeUserIdentifier: null,
      storePackage: null,
      storeUserIdentifier: null,
      linkType: null,
      linkTypes: [
        {
          text: "Device independant home link",
          value: "home"
        },
        {
          text: "Device independant library link ",
          value: "library"
        },
        {
          text: "Website store",
          value: "store"
        },
        {
          text: "Website coupon redemption",
          value: "coupon"
        },
        {
          text: "Website start page",
          value: "landing"
        }
      ],
      libraryPath: null,
      libraryPaths: [
        {
          text: "Overview",
          value: "overview"
        },
        {
          text: "Details page",
          value: "details"
        }
      ],
      storePackages,
      sections: {
        home: {
          webParameters: true,
          clickTracker: true,
          utmSourceParameterRequired: true
        },
        library: {
          path: true,
          webParameters: true,
          clickTracker: true,
          utmSourceParameterRequired: true
        },
        store: {
          webParameters: true,
          storeParameters: true,
          clickTracker: true
        },
        coupon: {
          couponCode: true,
          webParameters: true,
          clickTracker: true
        },
        landing: {
          webParameters: true,
          clickTracker: true
        }
      }
    };
  },
  computed: {
    finalUrl: function() {
      if (!this.valid) return;

      let link;
      // APP LINKS
      if (["home", "library"].includes(this.linkType)) {
        const weblink = buildUrl("https://www.7mind.de", this.tracking);
        const { adjust } = _.find(
          utmConfig.utm_sources_with_adjust,
          o => o.utm == this.tracking.utm_source
        );
        let deeplink = "home";
        if (this.linkType == "library") {
          deeplink =
            this.libraryPath == "details"
              ? `library/${this.contentType}/${this.contentIdentifier}`
              : "library";
        }
        const android = getAndroidLink(deeplink, adjust);
        link = getUniversalLink(adjust, deeplink, android, weblink);

        // WEB STORE
      } else if (this.linkType == "store") {
        link = buildUrl("http://store.7mind.de/#buy/" + this.storePackage, {
          ...this.tracking,
          uid: this.storeUserIdentifier,
          coupon: this.storeCoupon
        });

        // COUPON PAGE
      } else if (this.linkType == "coupon") {
        link = buildUrl("https://www.7mind.de/coupon", {
          ...this.tracking,
          code: this.couponCode
        });

        // WEB LANDING PAGE
      } else if (this.linkType == "landing") {
        link = buildUrl("https://www.7mind.de", this.tracking);
      }

      return this.useClickTracker ? getClickTrackerLink(link) : link;
    }
  }
};
</script>
