import mongoose, { Schema } from "mongoose";
import { MakeModelCtlForm } from "../../lib/squery/ModelCtrlManager";
import { SQuery } from "../../lib/squery/SQuery";
import { FileType } from "../../my-ts-app/src/lib/SQueryClient";
const defaultImage: FileType = {
  buffer: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQIAJQAlAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCABAAEADAREAAhEBAxEB/8QAGwAAAwEBAAMAAAAAAAAAAAAAAAcIBgkDBAX/xAA1EAACAQMDAwIEAwYHAAAAAAABAgMEBREABgcIEiETIhQxQVEVQoEjMmFicZE4Y3OCobTR/8QAGwEBAQEBAQADAAAAAAAAAAAAAAcGBQgCAwT/xAAyEQABAgYBAwIFAwMFAAAAAAABAAIDBAURITEGEkFRYbEicYGhwRMUQiMykRUzUrLw/9oADAMBAAIRAxEAPwDlVoiaPEnBF+5I9K91sn4dt5Z+ySobImqVGe4QKQQcEBS7e0EnHeVZdaahcaj1e0Z56YV99z56fa5wPWxCyfIeVy9FvAhjrjWwOw8dXvYZI3YEFU7tbiDjraFNTxWza1DLUUzpMtbVxLPU+qoXEgkYEocqGwnaoOSAM6pclQafINAhQgSM3Iu6473OtXxYA6AUpn+RVOoucYsYgG46WkhtjfFhvds3JGyVstddcRGiLJbx4q2HvqKf8e29TGrn8mvgQRVQYIUVvUUZbtGMK/cvtXIOBrlVCiSNSB/XhjqP8hh2rDPe3g3GsYXYptfqFKI/bxD0j+Jy217kWOr+RY5NjlTNyx0+37YObvYGqb1ZW9R5JEgJmo1Xub9qFzlQgyZQAuQchPb3TeucWj0v+rAu+HntlvfNu1v5YG7gYvVOP8vl6v8A0Zi0OLjF8O0Phv3v/HJtaxObKXWUWxTV4G4fj5Kus90vhljsVrdBMqhlNZKfIhVx4AAALkHuAZQMdwZdRxmgirxTFj/7TN7+I+AffvYi27jIcs5GaJBEGXzFfe2vhH/Ij/rixIN9WNjU1NTUVNFR0dPFBTwIsUUUSBUjRRhVVR4AAAAA1XmMbDaGMFgMADQCib3uiuL3m5OSTkknuV5dfJfFGiI0RGiJa7/3+Ss1hsU+A3sqKhMfLPlFP/BI/iBqc8n5P1B0jJOxpzh9wPYn6BVDiXEuktqE+3Iy1p+zj7gH5lSvyJtZbHcRcKKJUoaxj2oikCFwBlfsAfJA/qAMDU9VNVi8VbOi2LsO02H4T0KsQLPXg9hY1TgNJ3Mnhu0+wHz7UUZOM6udEp4psjDgWs613a/uO8jdtD0AyV56r9SNVqESYvdt7N3bpGBYHV9nWSTYJucW8W7o5c3RHtfa8Cd/b6tTUy5EVNEDgu5H9gB5J19lTqcClQDHjn5DuT4C+qk0mYrMwJeXHqSdAeSqkXpK6f8AYFJCOUeR5DWSLk+tXxUSN9+1PLEfxzrDHlVWnnH9jBx6Au++lQhw6i05o/1CPn1cGj6Df3SO6i9pcL7UrLJHw7fornDURTmuKV/xXYwK9nn8uQW/trUcfmqlNNiGos6SLWxbzdZHksnSpN0MUt/UDe/xX8WSejjklkWKJGd3IVVUZLE/IAa0JIAuVmACTYK2tg9DnHt02BQR8li7fjtwh9arSkrjB6IbyIgAPmoIBP3zqVVvlUzMxIkCVdaHq/c+Tf19lY6Bw6VlYUOZm29UXdjoHsLenuudHVPxxtniXnfc/H+z4qiO0Wp6dadaiYyyAPBG7ZY/P3MdY1bpJm/2tbzZqy2EKWniITuYgBx5QkjzgMAf0+uiKoteiF5iV59C+2Ke1cVXDdKU6tW3m4SL3fUxQgKi5+3cXP66lfNZkxZ9sAnDQP8AJ3+FYeAyjYNOdMAfE9x/wMD73S43D0dc3cg3u4bx3TuixRXG4zvMYZqiWVo1JPancqFQAMAAZAxrsS/LqZIQmy8CG7paLXsB9drhzPCqtUorpqYiNDnG9iSbemuyRXKPDW/OIbhDRbxtixxVWfhquB/Ugmx8wrfQj7EA61FMrErVmF0u7I2DghZCrUScozwyabg6IyD/AO8Jj9FPGMXIW9ankW6Qods7Qlwk0gHp1VwAyFBPgpEPcx+XcVH31jeT8mDuqRkzjTnfgfkrdcR4mWFtQnhnbWn3P4H1TI4R6j5OeuszcdDYqxm2jtjbdVR2pVPtqJPiYBLUkfzEYX+UD7nU9VNUS9ef+K3fP+rSf9SLREgNEVJ69ELzEuhHRrXGs6f46a3SKKujrK2H6HtkLd65H+9dSPl7OirFz9ENP01+FauExOuihrNguH13+VIdZz9zpQ7lkrqrkK9rXUlQyvA0uIg6tgoYR7MZGMY1QWUKlvgBrYLekjff532pm/kVXhzBe6O7qB12x2tpU11zVBuvR7cL/dVFHcvTtlVGB4aKokkjV0XPke2Rx/TUfMaJIxojZZ5Ay247i6uH7eHUIEJ00wE4dY9nW/C21v4W25J020HCezN2S7VoKy0wwT11II3qXWRQ05yxx3SFm7m+eGONfiX71k+mjos2b0573rt57e5AuN8qKy2vb2p6iGJFRGkR+4FPOcoB+uiJJdfXSltaK2726khvWuN3ZqJvwn0ovR8mKD979/8Ad939dEXOnRE5uKt4xb62Hab98X69WYFgryewMKpAFk7lTwvcfeB49rqcDONXOiVAVKRhx73daztf3DeBq+x6EYC89V+mmlVCJL2s2927t0nIsTu2jvIIuVSvTd1CzcJ3arortRzV23rqytUxREepBIBgSoD4PjwR4yAPPjXP5FQBWYYfDNojdX0R4K6XGOSGhRXMiDqhu2BsHyPyE27x1N9AMl/l3rc/gqi/Ryes+LLUPI0w+pUL6bNn6nPn66mkWp1GTa6R/WPSMWBuPkD4VXhUqmTz21D9AdTs3IsfmR5UodZXWlN1FCl2Zs+2VVq2db6j4kipIFRXzgEK8iqSEVQT2rk+Tkn5AcddxTALjcQMC4VIA/zm/wDdEVG9DfP2y+CuTLxufku53NbdW2Z6KEwQvUt6xmjYZUHwMK3nRFhuqjk+xctc5bn3xs6urZbHdXp2phUI0RISCNDmMnx7lOiJKX+6LZrNWXMlQ0ERKdykgufCAgecFiB+v00RZ/p15Tj2PuJtvXuqihsd5cd808rKlJOFIWQDyoD+1GJA+SMWAQg63ilaFNmP28Y2hv7kmzT2PjOj9CTYLF8yoJqksJmALxYfYAXcO484yRvuACSnxv8A3+uZbDYajOPZUVCZx8vKKfr88Ej+IGuryfk4d1SUi7GnOHsD7kfILjcS4kR0z9QbY7a0+7h9wD8yltqeqmo0RGiI0RGiJSci7sjvVUlqt06yUNK3czhfEk3kZDfVQDgYxkk/MYOiLG6ItdtbkS42NUorgrVlCiqiLkB4QD+U/mGCfafsACANETNtO47JfO4Wq4xzsme5PKuAMee1gDjyPOMaIvpaIjRF6F0v9msyk3O5QQMFDdhbLkE4BCD3EZ+w+h+2iJZ7s5Fqr1HJbrVG1LQyKA7N4mkH5gcEgKflgeTj54JGiLG6Iv/Z',
  encoding: 'base64',
  fileName: 'defaultImage.jpeg',
  size: 12,
  type: 'image/jpeg'
}
let TestSchema = SQuery.Schema({
  simpleArray:[ {
    type: Number,
    default: 20
  }],
  fileArray: [{
    type: SQuery.FileType,
    file: {
      length:4
    },
    // default: [defaultImage]
  }],
  bigint: {
    type: String,
  },
  bool: {
    type: Boolean,
  },
  str:{
    type: String,
  },
  num:{
    type: Number,
  },
  stringMap: {
    type: Map,
    of: ''
  },
  numberMap: {
    type: Map,
    //of:String 
  },
  ojectData: {
    type: {
      salut: String,
      famille: String,
      nombreuse: Number
    },
  },
  refArray_of_test: [{
    type: Schema.Types.ObjectId,
    ref: 'test',
    alien: true,
  }],
  ref_of_test: {
    type: Schema.Types.ObjectId,
    ref: 'test',
    strictAlien:true,
    // default:{
    //   // object de creation de test// TODO* cela va cree un boucle..
    // }
  },
});

const TestModel = mongoose.model("test", TestSchema);

const maker = MakeModelCtlForm({
  schema: TestSchema,
  model: TestModel,
})


export default TestModel;
