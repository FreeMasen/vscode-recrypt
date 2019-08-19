use miscreant::siv::Aes256Siv;
use rand::prelude::*;
#[macro_use]
extern crate serde_derive;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Payload {
    nonce: [u8;16],
    pub data: Vec<u8>,
}
#[wasm_bindgen]
pub fn encrypt(text: Vec<u8>, key: String) -> Option<Vec<u8>> {
    console_error_panic_hook::set_once();
    let key_vec = key_to_bytes(&key);
    let mut cipher = Aes256Siv::new(&key_vec);
    let mut rng = thread_rng();
    let mut nonce = [0u8;16];
    rng.fill_bytes(&mut nonce);
    let data = cipher.seal(&[nonce], &text);
    let ret = Payload {
        nonce,
        data,
    };
    bincode::serialize(&ret).ok()
}

fn key_to_bytes(key: &str) -> Vec<u8> {
    let mut ret = vec![0;64];
    let key_bytes = key.as_bytes();
    let mut loop_ct = 0;
    for i in 0..64 {
        let (b, ct) = byte_or_wrap(&key_bytes, loop_ct);
        ret[i] = b;
        if ct {
            loop_ct = 1;
        }
    }
    ret
}

fn byte_or_wrap(buf: &[u8], idx: usize) -> (u8, bool) {
    if let Some(b) = buf.get(idx) {
        (*b, false)
    } else if let Some(b) = buf.get(0) {
        (*b, true)
    } else {
        (0, true)
    }
}
#[wasm_bindgen]
pub fn decrypt(payload: Vec<u8>, key: String) -> Option<String> {
    console_error_panic_hook::set_once();
    let key_vec = key_to_bytes(&key);
    let payload: Payload = bincode::deserialize(&payload).ok()?;
    let mut cipher = Aes256Siv::new(&key_vec);
    let x = cipher.open(&[payload.nonce], &payload.data).ok()?;
    Some(String::from_utf8_lossy(&x).to_string())
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn round_trip_simple() {
        let orig = "super secret text".to_string();
        let key = "supersecretkey".to_string();
        let enc = encrypt(orig.as_bytes().to_vec(), key.clone()).unwrap();
        let dec = decrypt(enc, key).unwrap();
        assert_eq!(orig, dec);
    }
}