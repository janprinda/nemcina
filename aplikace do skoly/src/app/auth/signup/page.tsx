"use client";`n
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";`n
`n
export default function SignUpPage() {`n
  const [email, setEmail] = useState("");`n
  const [password, setPassword] = useState("");`n
  const [passwordConfirm, setPasswordConfirm] = useState("");`n
  const [name, setName] = useState("");`n
  const [step, setStep] = useState<1|2|3|4>(1);`n
  const [birthDate, setBirthDate] = useState<string>("");`n
  const [phoneCode, setPhoneCode] = useState<string>("+420");`n
  const [phoneNumber, setPhoneNumber] = useState<string>("");`n
  const digitsOnly = (s: string) => s.replace(/\D/g, "");`n
  const formatPhone = (s: string) => (digitsOnly(s).match(/.{1,3}/g)?.join(" ") ?? "");`n
  const [interests, setInterests] = useState<string[]>([]);`n
  const presetInterests = ["fotbal","hudba","cestovĂˇnĂ­","programovĂˇnĂ­","filmy","knihy","jazyk","hudebnĂ­ nĂˇstroj"];`n
  const [customInterest, setCustomInterest] = useState<string>("");`n
  const [role, setRole] = useState<'STUDENT'|'TEACHER'>('STUDENT');`n
  const [teacherCode, setTeacherCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);`n
  const [ok, setOk] = useState(false);`n
`n
  const [showPass, setShowPass] = useState(false);`n
  const [passTouched, setPassTouched] = useState(false);`n
`n
  const emailOk = /.+@.+\..+/.test(email);`n
  const passLenOk = password.length >= 8;`n
  const passUpperOk = /[A-Z]/.test(password);`n
  const passNumOk = /\d/.test(password);`n
  const passOk = passLenOk && passUpperOk && passNumOk;`n
  const nameOk = name.trim().length >= 1;`n
  const basicValid = emailOk && passOk && nameOk;`n
`n
  return (`n
    <div className="w-full">`n
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">`n
        <div className="card w-full max-w-xl">`n
          <div className="card-body space-y-5 text-center">`n
            <h1 className="text-2xl font-semibold">Registrace</h1>`n
            <div className="stepper">`n
              <span className={`step ${step===1?'step-active':''}`}></span>`n
              <span className={`step ${step===2?'step-active':''}`}></span>`n
              <span className={`step ${step===3?'step-active':''}`}></span>`n
              <span className={`step ${step===4?'step-active':''}`}></span>`n
            </div>`n
`n
            {step === 1 && (`n
              <div className="space-y-2 text-left">`n
                <input className={`input ${name ? (nameOk ? 'border-green-500' : 'border-red-500') : ''}`} placeholder="JmĂ©no" value={name} onChange={e=>setName(e.target.value)} />`n
                <input className={`input ${email ? (emailOk ? 'border-green-500' : 'border-red-500') : ''}`} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />`n
                <div className="relative">`n
                  <input`n
                    className={`input pr-16 ${password ? (passOk ? 'border-green-500' : 'border-red-500') : ''}`}`n
                    placeholder="Heslo"`n
                    type={showPass ? 'text' : 'password'}`n
                    value={password}`n
                    onChange={e=>setPassword(e.target.value)}`n
                    onFocus={()=> setPassTouched(true)}`n
                  />`n
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs muted hover:text-gray-200" onClick={()=> setShowPass(v=>!v)}>{showPass ? 'SkrĂ˝t' : 'Zobrazit'}</button>`n
                </div>`n
                <ul className="text-xs space-y-1 mt-1">`n
                  <li className={`${(!passTouched && !password) ? 'text-gray-300' : (passLenOk ? 'text-green-400' : 'text-red-400')}`}>â€˘ MinimĂˇlnÄ› 8 znakĹŻ</li>`n
                  <li className={`${(!passTouched && !password) ? 'text-gray-300' : (passUpperOk ? 'text-green-400' : 'text-red-400')}`}>â€˘ AlespoĹ jedno velkĂ© pĂ­smeno (Aâ€“Z)</li>`n
                  <li className={`${(!passTouched && !password) ? 'text-gray-300' : (passNumOk ? 'text-green-400' : 'text-red-400')}`}>â€˘ AlespoĹ jedno ÄŤĂ­slo (0â€“9)</li>`n
                </ul>`n
              </div>`n
            )}`n
`n
            {step === 2 && (`n
              <div className="space-y-4">`n
                <div className="text-left">`n
                  <label className="block text-sm mb-1">Datum narozenĂ­</label>`n
                  <input className="input" type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} />`n
                </div>`n
                <div className="text-left">`n
                  <label className="block text-sm mb-1">Telefon</label>`n
                  <div className="flex gap-2">`n
                    <select className="select" value={phoneCode} onChange={e=>setPhoneCode(e.target.value)}>`n
                      <option value="+420">+420 (CZ)</option>`n
                      <option value="+421">+421 (SK)</option>`n
                      <option value="+49">+49 (DE)</option>`n
                      <option value="+43">+43 (AT)</option>`n
                      <option value="+44">+44 (UK)</option>`n
                      <option value="+48">+48 (PL)</option>`n
                    </select>`n
                    <input`n
                      className="input flex-1"`n
                      placeholder="TelefonnĂ­ ÄŤĂ­slo"`n
                      value={formatPhone(phoneNumber)}`n
                      onChange={e=> setPhoneNumber(digitsOnly(e.target.value))}`n
                      inputMode="numeric"`n
                      pattern="[0-9 ]*"`n
                    />`n
                  </div>`n
                </div>`n
                <div className="space-y-2 text-left">`n
                  <div className="muted text-sm">ZĂˇjmy</div>`n
                  <div className="flex flex-wrap gap-2">`n
                    {presetInterests.map((i) => (`n
                      <button key={i} type="button" className={`btn ${interests.includes(i) ? 'btn-primary' : 'btn-secondary'}`} onClick={()=> setInterests(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i])}>{i}</button>`n
                    ))}`n
                  </div>`n
                  <div className="flex gap-2">`n
                    <input className="input flex-1" placeholder="PĹ™idat vlastnĂ­ zĂˇjem" value={customInterest} onChange={e=>setCustomInterest(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter'){ e.preventDefault(); const v = customInterest.trim(); if (!v) return; setInterests(prev => prev.includes(v)? prev : [...prev, v]); setCustomInterest(''); } }} />`n
                    <button className="btn btn-secondary" type="button" onClick={()=> { const v = customInterest.trim(); if (!v) return; setInterests(prev => prev.includes(v) ? prev : [...prev, v]); setCustomInterest(''); }}>PĹ™idat +</button>`n
                  </div>`n
                  {interests.length>0 && (`n
                    <div className="flex flex-wrap gap-2">`n
                      {interests.map((i)=>(`n
                        <span key={i} className="chip">`n
                          {i}`n
                          <button type="button" className="ml-2 text-xs opacity-70 hover:opacity-100" onClick={()=> setInterests(prev => prev.filter(x=> x!==i))}>Ă—</button>`n
                        </span>`n
                      ))}`n
                    </div>`n
                  )}`n
                </div>`n
              </div>`n
            )}`n
`n
            {step === 3 && (`n
              <div className="space-y-4 text-left">`n
                <div className="muted text-sm">Typ ĂşÄŤtu</div>`n
                <div className="flex gap-2">`n
                  <button className={`btn ${role==='STUDENT'?'btn-primary':'btn-secondary'}`} type="button" onClick={()=> setRole('STUDENT')}>Student</button>`n
                  <button className={`btn ${role==='TEACHER'?'btn-primary':'btn-secondary'}`} type="button" onClick={()=> setRole('TEACHER')}>UÄŤitel</button>`n
                </div>`n
                {role==='TEACHER' && (`n
                  <input className="input" placeholder="OvÄ›Ĺ™ovacĂ­ kĂłd uÄŤitele" value={teacherCode} onChange={e=>setTeacherCode(e.target.value)} />`n
                )}`n
              </div>`n
            )}`n
`n
            {step === 4 && (`n
              <div className="space-y-2 text-sm text-left">`n
                <div className="muted">ShrnutĂ­</div>`n
                <div>JmĂ©no: {name}</div>`n
                <div>Email: {email}</div>`n
                <div>Datum narozenĂ­: {birthDate || 'â€”'}</div>`n
                <div>Telefon: {(phoneCode && phoneNumber) ? `${phoneCode} ${phoneNumber}` : 'â€”'}</div>`n
                <div>ZĂˇjmy: {interests.join(', ') || 'â€”'}</div>`n
                <div>ĂšÄŤet: {role==='TEACHER' ? 'UÄŤitel' : 'Student'}</div>`n
                <input className="input mt-2" placeholder="Zadejte znovu heslo" type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} />`n
              </div>`n
            )}`n
`n
            {error && <div className="text-sm text-red-400">{error}</div>}`n
            {ok && <div className="text-sm text-green-400">ĂšÄŤet vytvoĹ™en. <Link className="underline" href="/auth">PĹ™ejĂ­t na pĹ™ihlĂˇĹˇenĂ­</Link></div>}`n
            <div className="flex gap-2 justify-center">`n
              {step > 1 && !ok && (`n
                <button className="btn btn-secondary" onClick={()=> setStep((s)=> (s>1 ? ((s-1) as 1|2|3|4) : s))}>ZpÄ›t</button>`n
              )}`n
              {!ok && (`n
                <button className="btn btn-primary" onClick={async()=>{`n
                  setError(null);`n
                  if (step === 1) {`n
                    if (!basicValid) { setError('VyplĹ sprĂˇvnÄ› jmĂ©no, email a heslo.'); return; }`n
                    setStep(2); return;`n
                  }`n
                  if (step === 2) { setStep(3); return; }`n
                  if (step === 3) { setStep(4); return; }`n
                  if (passwordConfirm !== password) { setError('Hesla se neshodujĂ­.'); return; }`n
                  setOk(false);`n
                  const res = await fetch("/api/auth/register", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password, birthDate, interests, phoneCode, phoneNumber, role, teacherCode, joinClass, classCode }) });
                  const j = await res.json();
                  if (!res.ok) { setError(j.error || 'Chyba registrace'); } else {
                    setOk(true);
                    // Auto login after successful registration
                    await signIn('credentials', { redirect: true, email, password, callbackUrl: '/' });
                  }
                }}>
                  {step === 1 ? (basicValid ? 'DalĹˇĂ­' : 'Zaregistrovat') : step === 2 ? 'DalĹˇĂ­' : step === 3 ? 'DalĹˇĂ­' : 'VytvoĹ™it ĂşÄŤet'}`n
                </button>`n
              )}`n
            </div>`n
            <div className="text-sm">MĂˇte ĂşÄŤet? <Link className="underline" href="/auth">PĹ™ihlĂˇsit</Link></div>`n
          </div>`n
        </div>`n
      </div>`n
    </div>`n
  );`n
}`n
`n




