import axios from "axios";

class HttpClient {
  static async Post(url, data, headers) {
    try {
      const response = await axios.post(url, data,  {headers} );
      return response;
    } catch (err) {
      if (err.response.status == 400) {
        return err.response;
      }
      return err.response;
    }
  }
}

export default HttpClient;
