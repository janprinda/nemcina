"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [passTouched, setPassTouched] = useState(false);
  const [name, setName] = useState("");
  const [step, setStep] = useState<1|2|3|4>(1);
  const [birthDate, setBirthDate] = useState("");
  const [phoneCode, setPhoneCode] = useState("+420");
  const [phoneNumber, setPhoneNumber] = useState("");
  const digitsOnly = (s: string) => s.replace(/\D/g, "");
  const formatPhone = (s: string) => (digitsOnly(s).match(/.{1,3}/g)?.join(" ") ?? "");
  const [interests, setInterests] = useState<string[]>([]);
  const presetInterests = ["fotbal","hudba","cestování","programování","filmy","knihy","jazyk","hra na nástroj"];
  const [customInterest, setCustomInterest] = useState("");
  const [role, setRole] = useState<'STUDENT'|'TEACHER'>("STUDENT");
  const [teacherCode, setTeacherCode] = useState("");
  const [joinClass, setJoinClass] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const emailOk = /.+@.+\..+/.test(email);
  const passLenOk = password.length >= 8;
  const passUpperOk = /[A-Z]/.test(password);
  const passNumOk = /\d/.test(password);
  const passOk = passLenOk && passUpperOk && passNumOk;
  const nameOk = name.trim().length >= 1;
  const basicValid = emailOk && passOk && nameOk;
  const birthOk = birthDate ? /^\d{4}-\d{2}-\d{2}$/.test(birthDate) : false;
  const phoneOk = digitsOnly(phoneNumber).length >= 6;
  const teacherOk = role !== 'TEACHER' || teacherCode.trim().length > 0;

  return (
    <div className="w-full">
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="card w-full max-w-xl">
          <div className="card-body space-y-5 text-center">
            <h1 className="text-2xl font-semibold">Registrace</h1>
            <div className="stepper">
              <span className={`step ${step===1?'step-active':''}`}></span>
              <span className={`step ${step===2?'step-active':''}`}></span>
              <span className={`step ${step===3?'step-active':''}`}></span>
              <span className={`step ${step===4?'step-active':''}`}></span>
            </div>

            {step === 1 && (
              <div className="space-y-2 text-left">
                <input className={`input ${name ? (nameOk ? 'border-green-500' : 'border-red-500') : ''}`} placeholder="Jméno" value={name} onChange={e=>setName(e.target.value)} />
                <input className={`input ${email ? (emailOk ? 'border-green-500' : 'border-red-500') : ''}`} placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
                <div className="relative">
                  <input
                    className={`input pr-16 ${password ? (passOk ? 'border-green-500' : 'border-red-500') : ''}`}
                    placeholder="Heslo"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    onFocus={()=> setPassTouched(true)}
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs muted hover:text-gray-200" onClick={()=> setShowPass(v=>!v)}>{showPass ? 'Skrýt' : 'Zobrazit'}</button>
                </div>
                <ul className="text-xs space-y-1 mt-1">
                  <li className={`${(!passTouched && !password) ? 'text-gray-200' : (passLenOk ? 'text-green-400' : 'text-red-400')}`}>• Minimálně 8 znaků</li>
                  <li className={`${(!passTouched && !password) ? 'text-gray-200' : (passUpperOk ? 'text-green-400' : 'text-red-400')}`}>• Alespoň jedno velké písmeno (A‑Z)</li>
                  <li className={`${(!passTouched && !password) ? 'text-gray-200' : (passNumOk ? 'text-green-400' : 'text-red-400')}`}>• Alespoň jedno číslo (0‑9)</li>
                </ul>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm mb-1">Datum narození</label>
                  <input className={`input ${birthDate ? (birthOk ? 'border-green-500' : 'border-red-500') : ''}`} type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} />
                </div>
                <div className="text-left">
                  <label className="block text-sm mb-1">Telefon</label>
                  <div className="flex gap-2">
                    <select className="select" value={phoneCode} onChange={e=>setPhoneCode(e.target.value)}>
                      <option value="+420">+420 (CZ)</option>
                      <option value="+421">+421 (SK)</option>
                      <option value="+49">+49 (DE)</option>
                      <option value="+43">+43 (AT)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+48">+48 (PL)</option>
                    </select>
                    <input
                      className={`input flex-1 ${phoneNumber ? (phoneOk ? 'border-green-500' : 'border-red-500') : ''}`}
                      placeholder="Telefonní číslo"
                      value={formatPhone(phoneNumber)}
                      onChange={e=> setPhoneNumber(digitsOnly(e.target.value))}
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                    />
                  </div>
                  <div className="text-xs muted mt-1">Číslo se formátuje po třech číslech automaticky.</div>
                </div>

                <div className="space-y-2 text-left">
                  <div className="muted text-sm">Zájmy</div>
                  <div className="flex flex-wrap gap-2">
                    {presetInterests.map((i) => (
                      <button key={i} type="button" className={`btn ${interests.includes(i) ? 'btn-primary' : 'btn-secondary'}`} onClick={()=> setInterests(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i])}>{i}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input className="input flex-1" placeholder="Přidat vlastní zájem" value={customInterest} onChange={e=>setCustomInterest(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter'){ e.preventDefault(); const v = customInterest.trim(); if (!v) return; setInterests(prev => prev.includes(v)? prev : [...prev, v]); setCustomInterest(''); } }} />
                    <button className="btn btn-secondary" type="button" onClick={()=> { const v = customInterest.trim(); if (!v) return; setInterests(prev => prev.includes(v) ? prev : [...prev, v]); setCustomInterest(''); }}>Přidat +</button>
                  </div>
                  {interests.length>0 && (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((i)=>(
                        <span key={i} className="chip">
                          {i}
                          <button type="button" className="ml-2 text-xs opacity-70 hover:opacity-100" onClick={()=> setInterests(prev => prev.filter(x=> x!==i))}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 text-left">
                <div>
                  <div className="muted text-sm">Typ účtu</div>
                  <div className="flex gap-2 mt-2">
                    <button className={`btn ${role==='STUDENT'?'btn-primary':'btn-secondary'}`} type="button" onClick={()=> setRole('STUDENT')}>Student</button>
                    <button className={`btn ${role==='TEACHER'?'btn-primary':'btn-secondary'}`} type="button" onClick={()=> setRole('TEACHER')}>Učitel</button>
                  </div>
                </div>

                {role==='STUDENT' && (
                  <div className="space-y-2">
                    <div className="muted text-sm">Připojení do třídy</div>
                    <div className="flex gap-2">
                      <button type="button" className={`btn ${joinClass ? 'btn-primary' : 'btn-secondary'}`} onClick={()=> setJoinClass(true)}>Chci se připojit</button>
                      <button type="button" className={`btn ${!joinClass ? 'btn-primary' : 'btn-secondary'}`} onClick={()=> setJoinClass(false)}>Budu sám</button>
                    </div>
                    {joinClass && (
                      <input className={`input ${classCode ? 'border-green-500' : 'border-red-500'}`} placeholder="Kód třídy / učitele" value={classCode} onChange={e=>setClassCode(e.target.value)} />
                    )}
                    <div className="text-xs muted">Kód třídy ti dá učitel. Volbu lze změnit později v profilu.</div>
                  </div>
                )}

                {role==='TEACHER' && (
                  <div className="space-y-2">
                    <input className={`input ${teacherCode ? (teacherOk ? 'border-green-500' : 'border-red-500') : ''}`} placeholder="Ověřovací kód učitele" value={teacherCode} onChange={e=>setTeacherCode(e.target.value)} />
                    <div className="text-xs muted">Možnost vytváření tříd přidáme později.</div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2 text-sm">
                <div className="muted">Shrnutí</div>
                <div>Jméno: {name}</div>
                <div>Email: {email}</div>
                <div>Datum narození: {birthDate || '—'}</div>
                <div>Telefon: {(phoneCode && phoneNumber) ? `${phoneCode} ${formatPhone(phoneNumber)}` : '—'}</div>
                <div>Zájmy: {interests.join(', ') || '—'}</div>
                <div>Účet: {role==='TEACHER' ? 'Učitel' : 'Student'}</div>
                {role==='STUDENT' && (
                  <div>Připojení do třídy: {joinClass ? (classCode || '—') : 'Ne'}</div>
                )}
                <div className="relative mt-2">
                  <input
                    className={`input pr-16 ${passwordConfirm ? ((passwordConfirm===password) ? 'border-green-500' : 'border-red-500') : ''}`}
                    placeholder="Zadejte znovu heslo"
                    type={showPassConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={e=>setPasswordConfirm(e.target.value)}
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs muted hover:text-gray-200" onClick={()=> setShowPassConfirm(v=>!v)}>{showPassConfirm ? 'Skrýt' : 'Zobrazit'}</button>
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-400">{error}</div>}
            {ok && <div className="text-sm text-green-400">Účet vytvořen. <Link className="underline" href="/auth">Přejít na přihlášení</Link></div>}
            <div className="flex gap-2 justify-center">
              {step > 1 && !ok && (
                <button className="btn btn-secondary" onClick={()=> setStep((s)=> (s>1 ? ((s-1) as 1|2|3|4) : s))}>Zpět</button>
              )}
              {!ok && (
                <button className="btn btn-primary" onClick={async()=>{
                  setError(null);
                  if (step === 1) {
                    if (!basicValid) { setError('Vyplň správně jméno, email a heslo.'); return; }
                    setStep(2); return;
                  }
                  if (step === 2) { setStep(3); return; }
                  if (step === 3) { setStep(4); return; }
                  // step 4 → submit
                  if (passwordConfirm !== password) { setError('Hesla se neshodují.'); return; }
                  const res = await fetch("/api/auth/register", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password, birthDate, interests, phoneCode, phoneNumber, role, teacherCode, joinClass, classCode }) });
                  const j = await res.json();
                  if (!res.ok) { setError(j.error || 'Chyba registrace'); } else { setOk(true); }
                }}>
                  {step === 1 ? (basicValid ? 'Další' : 'Zaregistrovat') : step === 2 ? 'Další' : step === 3 ? 'Další' : 'Vytvořit účet'}
                </button>
              )}
            </div>
            <div className="text-sm">Máte účet? <Link className="underline" href="/auth">Přihlásit</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}

