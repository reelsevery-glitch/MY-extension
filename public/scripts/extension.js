// ეს ფაილი სერვერიდან ჩაიტვირთება Extension-ის მიერ
const API_INSTANCE = 'https://my-extension-production-55ba.up.railway.app/'
const FRONT_URL = API_INSTANCE + 'panel/'

//=========================================================================================> AUTH
let IS_AUTH = false

setTimeout(async () => {
  let currentUrl = document.URL
  if (currentUrl.includes('home.ss.ge')) await check_auth_ss()
  if (currentUrl.includes('myhome.ge')) await check_auth_myhome()
}, 500)

async function check_auth_ss() {
  const token_local = get_token_from_local_storage()
  let auth_data = null
  if (token_local) auth_data = await api_refresh_token(token_local)
  if (!token_local) { return }
  if (auth_data?.message) {
    set_user_to_local_storage(null)
    set_token_to_local_storage(null)
    return
  }
  if (auth_data) {
    set_user_to_local_storage(auth_data.user)
    set_token_to_local_storage(auth_data.accessToken)
    IS_AUTH = true
  } else {
    verification_from_ss(true)
  }
}

async function check_auth_myhome() {
  const url_params = new URLSearchParams(window.location.search)
  const token_url = url_params.get('SH-token')
  const token_local = get_token_from_local_storage()
  let auth_data = null
  if (token_url) auth_data = await api_refresh_token(token_url)
  if (!token_url && token_local) auth_data = await api_refresh_token(token_local)
  if (!auth_data) return
  if (auth_data.message) {
    set_user_to_local_storage(null)
    set_token_to_local_storage(null)
    return
  }
  if (auth_data) {
    set_user_to_local_storage(auth_data.user)
    set_token_to_local_storage(auth_data.accessToken)
    IS_AUTH = true
  }
  if (token_url) {
    window.location = 'https://www.myhome.ge'
  }
}

async function verification_from_ss(loading) {
  try {
    const element = document.getElementById('__NEXT_DATA__')
    const obj = JSON.parse(element.textContent)
    const session = obj.props.pageProps.session?.user
    if (!session) return
    const data = {
      ss_name: session.name,
      ss_sub: session.sub,
      ss_phone: Number(session.phone_number),
      ss_pin: session.PIN
    }
    let res = await api_broker_login_pin(data)
    if (res.message) res = await api_broker_registration(data)
    if (res.message) return
    set_user_to_local_storage(res.user)
    set_token_to_local_storage(res.accessToken)
    IS_AUTH = true
    if (loading) setTimeout(() => { insers_base_modal() }, 1000)
  } catch (e) {}
}

// ==== LOCAL STORAGE
function set_user_to_local_storage(user) {
  if (user == null) localStorage.removeItem('myestate_user')
  else localStorage.setItem('myestate_user', JSON.stringify(user))
}
function set_token_to_local_storage(token) {
  if (token == null) localStorage.removeItem('myestate_token')
  else localStorage.setItem('myestate_token', token)
}
function get_token_from_local_storage() {
  return localStorage.getItem('myestate_token')
}

// ==== API
async function api_broker_registration(data) {
  const response = await fetch(`${API_INSTANCE}auth/broker_registration`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  })
  return await response.json()
}
async function api_broker_login_pin(data) {
  const response = await fetch(`${API_INSTANCE}auth/broker_login_pin`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  })
  return await response.json()
}
async function api_refresh_token(token) {
  const response = await fetch(API_INSTANCE + 'auth/login/access-token', {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": 'Bearer ' + token, "refreshToken": token }
  })
  return await response.json()
}

//=========================================================================================> UI
setInterval(async () => {
  let currentUrl = document.URL
  if (currentUrl.includes('https://home.ss.ge/')) await append_UI({ ss: true, myhome: false })
  if (currentUrl.includes('https://www.myhome.ge/')) await append_UI({ ss: false, myhome: true })
}, 1000)

function get_inner_container_HTML() {
  const item = document.createElement('div')
  item.id = 'inner_container'
  item.style.cssText = 'position:fixed;top:80px;right:20px;z-index:999999;display:none;'
  return item
}
function get_buttons_container_HTML() {
  const item = document.createElement('div')
  item.id = 'buttons_container'
  item.style.cssText = 'display:flex;flex-direction:column;gap:8px;background:rgba(255,255,255,0.9);padding:10px;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.2);border:1px solid #ddd;'
  return item
}

function get_base_btn_HTML() {
  const item = document.createElement('div')
  item.id = 'open_base_btn'
  item.title = 'პანელის გახსნა'
  item.style.cssText = 'width:40px;height:40px;cursor:pointer;background:#9c27b0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;transition:0.3s;'
  item.textContent = '📋'
  return item
}

function get_save_btn_HTML(id, title, emoji, color = '#2196F3') {
  const item = document.createElement('div')
  item.id = id
  item.title = title
  item.style.cssText = `width:40px;height:40px;cursor:pointer;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;transition:0.3s;`
  item.textContent = emoji
  return item
}

async function append_UI(config) {
  const body = document.querySelector('body')
  let inner = document.getElementById('inner_container')
  
  if (!inner && body) {
    inner = get_inner_container_HTML()
    const btns = get_buttons_container_HTML()
    inner.appendChild(btns)
    body.appendChild(inner)
    
    // Auth Check UI
    if (!IS_AUTH && config.ss) {
      const vBtn = get_save_btn_HTML('verification_btn_ss', 'ავტორიზაცია', '🔑', '#f44336')
      btns.appendChild(vBtn)
      vBtn.onclick = () => verification_from_ss(false)
    }

    if (IS_AUTH) {
      const baseBtn = get_base_btn_HTML()
      btns.appendChild(baseBtn)
      validate_base_modal()

      if (config.ss) {
        const sBtn = get_save_btn_HTML('save_btn_ss', 'SS.GE შენახვა', '💾')
        btns.appendChild(sBtn)
        sBtn.onclick = find_draft_SS
        
        const fBtn = get_save_btn_HTML('fast_upload_btn_ss', 'სწრაფი ატვირთვა', '🏠', '#4CAF50')
        btns.appendChild(fBtn)
        fBtn.onclick = fast_save_upload_to_ss
      }

      if (config.myhome) {
        const mBtn = get_save_btn_HTML('save_btn_myhome', 'Myhome შენახვა', '💾')
        btns.appendChild(mBtn)
        mBtn.onclick = find_draft_myhome

        const fMBtn = get_save_btn_HTML('fast_upload_btn_myhome', 'სწრაფი ატვირთვა', '🏡', '#FF9800')
        btns.appendChild(fMBtn)
        fMBtn.onclick = fast_save_upload_to_myhome
      }
    }
    inner.style.display = 'block'
  }
}

function validate_base_modal() {
  const open_btn = document.getElementById('open_base_btn')
  if (open_btn) {
    open_btn.onclick = () => insers_base_modal()
  }
  
  window.addEventListener("message", (event) => {
    if (event.data?.type === "CLOSE_BASE_MODAL") {
      destroy_base_modal()
    }
  })
}

function destroy_base_modal() {
  const modal = document.getElementById('base_modal')
  if (modal) modal.remove()
}

function insers_base_modal() {
  destroy_base_modal()
  const token = get_token_from_local_storage()
  if (!token) return
  
  const modal = document.createElement('div')
  modal.id = 'base_modal'
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999999;display:flex;align-items:center;justify-content:center;'
  modal.innerHTML = `
    <div style="position:relative;background:white;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3);">
      <div id="close_modal" style="position:absolute;top:10px;right:15px;cursor:pointer;font-size:24px;font-weight:bold;color:#666;z-index:10;">×</div>
      <iframe src="${FRONT_URL}?token=${token}" height="750" width="1000" style="border:none;"></iframe>
    </div>
  `
  document.body.appendChild(modal)
  document.getElementById('close_modal').onclick = destroy_base_modal
  modal.onclick = (e) => { if(e.target === modal) destroy_base_modal() }
}

// ==== API ACTIONS (SS & MYHOME)
async function find_draft_SS() {
  if (!document.URL.includes('/udzravi-qoneba/')) return
  const draft = await save_ss(document.URL)
  if (draft) insers_base_modal()
}

async function fast_save_upload_to_ss() {
  let draft = await save_ss(document.URL)
  if (draft) window.open(`https://home.ss.ge/ka/udzravi-qoneba/create/SH-${draft.id}`, '_blank')
}

async function save_ss(url) {
  const response = await fetch(`${API_INSTANCE}ss/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${get_token_from_local_storage()}` },
    body: JSON.stringify({ url })
  })
  return response.ok ? await response.json() : null
}

async function find_draft_myhome() {
  if (!document.URL.includes('/pr/')) return
  const phone = await get_draft_number_MY()
  const nextData = document.getElementById('__NEXT_DATA__').textContent
  const draft = await save_myhome(document.URL, phone, nextData)
  if (draft) insers_base_modal()
}

async function fast_save_upload_to_myhome() {
  const phone = await get_draft_number_MY()
  const nextData = document.getElementById('__NEXT_DATA__').textContent
  const draft = await save_myhome(document.URL, phone, nextData)
  if (draft) window.open(`https://www.myhome.ge/ka/SH-${draft.id}/auto-pay/`, '_blank')
}

async function save_myhome(url, owner_phone, next_data) {
  const response = await fetch(`${API_INSTANCE}myhome/save/${owner_phone}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${get_token_from_local_storage()}` },
    body: JSON.stringify({ url, next_data: JSON.parse(next_data) })
  })
  return response.ok ? await response.json() : null
}

async function get_draft_number_MY() {
  try {
    const siteKey = '6LeziPEpAAAAAHuR9vWBVCrfklSbWt8zixM4jAbM'
    const token = await window.grecaptcha.execute(siteKey, { action: 'submit' })
    const data = JSON.parse(document.getElementById('__NEXT_DATA__').textContent)
    const uuid = data.props.pageProps.dehydratedState.queries[0].state.data.data.statement.uuid
    const res = await fetch(`https://api-statements.tnet.ge/v1/statements/phone/show?statement_uuid=${uuid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Website-Key": "myhome" },
      body: JSON.stringify({ response_token: token })
    })
    const json = await res.json()
    return json.data.phone_number
  } catch { return null }
}
