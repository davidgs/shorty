/* The MIT License (MIT)
 *
 * Copyright (c) 2022-present David G. Simmons
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { ChangeEvent, FormEvent, SyntheticEvent, useState } from "react";
import axios from 'axios';
import {
  Button,
  Col,
  FloatingLabel,
  Form,
  FormControl,
  InputGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./stores/store";
import { Eye, EyeSlashFill } from "react-bootstrap-icons";

export default function ShortForm() {
  const dispatch = useDispatch();
  const dark = useSelector((state: RootState) => state.dark.dark);
  const darkClass = dark ? "header-stuff-dark" : "header-stuff";
  const [passwordShown, setPasswordShown] = useState<boolean>(false);
  const pwField = document.getElementById("wifi-passwd");
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOriginalUrl(event.target.value);
  };

  const toggle = () => {
    if (!passwordShown) {
      pwField?.setAttribute("type", "text");
    } else {
      pwField?.setAttribute("type", "password");
    }
    setPasswordShown(!passwordShown);
  };

  const valueChanged = (value: SyntheticEvent) => {
    const tar = value.target as HTMLInputElement;
    const val = tar.value;
    setOriginalUrl(val);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      // Make a POST request to the server to shorten the link
      const response = await axios.post('http://localhost:3030/shorten', { originalUrl });

      // Update state with the shortened URL
      setShortenedUrl(response.data.shortenedUrl);

      // Execute the callback function
    } catch (error) {
      console.error('Error shortening link:', error);
    }
  };

  return (
    <>
      <InputGroup size="lg">
        <Col sm={12}>
          <OverlayTrigger
            placement="auto"
            overlay={
              <Tooltip id="ssid-label-tooltip">
                Enter the SSID (Network Name) for the WiFi network
              </Tooltip>
            }
          >
            <FloatingLabel
              label="Enter the full link to shorten"
              className={darkClass}
            >
              <FormControl
                required
                className={darkClass}
                type="text"
                size="sm"
                id="wifi-ssid"
                aria-label="Enter a URL to shorten"
                aria-describedby="Text field to enter a URL to shorten"
                value={originalUrl}
                onChange={(e) => {
                  valueChanged(e);
                }}
              />
            </FloatingLabel>
          </OverlayTrigger>
        </Col>
      </InputGroup>
      <p />
      <InputGroup size="lg">
        <Col sm={12}>
          <OverlayTrigger
            placement="auto"
            overlay={
              <Tooltip id="ssid-label-tooltip">
                Your shortened URL will show here
              </Tooltip>
            }
          >
            <FloatingLabel label="Your shortened link" className={darkClass}>
              <FormControl
                required
                className={darkClass}
                type="text"
                size="sm"
                disabled={true}
                id="wifi-passwd"
                aria-label={`Your Shortened link is ${shortenedUrl}`}
                aria-describedby={`Your Shortened link is ${shortenedUrl}`}
                value={shortenedUrl ? shortenedUrl : ""}
              />
            </FloatingLabel>
          </OverlayTrigger>
          </Col>

      </InputGroup>
      <InputGroup>
        <Button variant='primary' onClick={handleSubmit} >Submit</Button>
      </InputGroup>
    </>
  );
}
