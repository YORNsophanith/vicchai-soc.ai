import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  ExternalLink, 
  Database, 
  Hash, 
  Link2, 
  Server, 
  CheckCircle2, 
  Radio, 
  Filter, 
  Plus, 
  Layers,
  Zap
} from 'lucide-react';
import { socStore } from '../../services/storage';
import { IOC, TLP } from '../../types/soc';

interface ThreatIntelOpenCTIProps {
  onAskAI: (prompt: string) => void;
}

export const ThreatIntelOpenCTI: React.FC<ThreatIntelOpenCTIProps> = ({ onAskAI }) => {
  const [iocs, setIocs] = useState<IOC[]>(socStore.getIOCs());
  const [lookupQuery, setLookupQuery] = useState('');
  const [activeIoc, setActiveIoc] = useState<IOC | null>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const unsub = socStore.subscribe(() => {
      const current = socStore.getIOCs();
      setIocs(current);
      if (!activeIoc && current.length > 0) {
        setActiveIoc(current[0]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (iocs.length > 0 && !activeIoc) {
      setActiveIoc(iocs[0]);
    }
  }, [iocs]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      // Check if exists
      const existing = iocs.find(i => i.value.toLowerCase().includes(lookupQuery.toLowerCase().trim()));
      if (existing) {
        setActiveIoc(existing);
      } else {
        // Create new enriched IOC in real time
        const newIoc: IOC = {
          id: `ioc-${Date.now()}`,
          type: lookupQuery.includes('.') && !lookupQuery.includes('/') && !lookupQuery.includes(':') && isNaN(Number(lookupQuery.split('.')[0])) ? 'DOMAIN' : lookupQuery.startsWith('http') ? 'URL' : lookupQuery.length > 32 ? 'HASH_SHA256' : 'IP',
          value: lookupQuery.trim(),
          reputation: 'SUSPICIOUS',
          confidenceScore: 84,
          tlp: 'TLP:AMBER',
          threatActor: 'Unattributed Threat Group',
          malwareFamily: 'Automated Sandbox Match',
          firstSeen: '2026-09-30 07:00:00',
          lastSeen: '2026-09-30 07:25:00',
          openCtiId: `cti--lookup--${Date.now()}`,
          tags: ['live-lookup', 'opencti-enriched', 'sandbox'],
          sources: ['OpenCTI Live GraphQL', 'VirusTotal', 'AlienVault OTX'],
        };
        socStore.addIOC(newIoc);
        setActiveIoc(newIoc);
      }
      setIsSearching(false);
    }, 600);
  };

  const filteredIocs = iocs.filter(ioc => {
    return filterType === 'ALL' || ioc.type === filterType;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center space-x-2">
            <Globe2 className="w-6 h-6 text-cyan-400" />
            <span>OpenCTI Threat Intelligence Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            IP, Domain, Hash, Threat Actor & Campaign Enrichment with Confidence & TLP Classification
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#0e172a] px-3 py-1.5 rounded-xl border border-[#1e293b] text-xs">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-mono">
            <Radio className="w-3 h-3 animate-ping" />
            <span>OpenCTI Feeds: 6 Synced</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 font-mono text-[11px]">12,480 IOCs in Local Cache</span>
        </div>
      </div>

      {/* Lookup Sandbox Bar */}
      <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-4 shadow-xl">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter IP (e.g. 185.220.101.5), Domain, URL, or SHA-256 Hash for instant OpenCTI analysis..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full bg-[#080d17] border border-[#1e2d4d] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Querying OpenCTI...' : 'Enrich with OpenCTI'}</span>
          </button>
        </form>

        {/* Quick Example Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#1b2742] text-[11px]">
          <span className="text-slate-400 font-semibold">Quick Lookups:</span>
          <button
            onClick={() => { setLookupQuery('185.220.101.5'); }}
            className="px-2 py-0.5 rounded bg-[#121e36] text-cyan-300 font-mono hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            185.220.101.5 (Cobalt Strike C2)
          </button>
          <button
            onClick={() => { setLookupQuery('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'); }}
            className="px-2 py-0.5 rounded bg-[#121e36] text-purple-300 font-mono hover:bg-purple-500/20 border border-purple-500/30"
          >
            Mimikatz SHA-256
          </button>
          <button
            onClick={() => { setLookupQuery('update-microsoft-cloudservice.com'); }}
            className="px-2 py-0.5 rounded bg-[#121e36] text-amber-300 font-mono hover:bg-amber-500/20 border border-amber-500/30"
          >
            update-microsoft-cloudservice.com (FIN7)
          </button>
        </div>
      </div>

      {/* Main Grid: Left IOC List, Right Detailed Enrichment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: IOC List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Correlated Threat Indicators ({filteredIocs.length})
            </h3>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#0e1626] border border-[#1e2d4d] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="IP">IP Addresses</option>
              <option value="DOMAIN">Domains</option>
              <option value="HASH_SHA256">Hashes</option>
              <option value="URL">URLs</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredIocs.map((ioc) => {
              const isSelected = activeIoc?.id === ioc.id;
              return (
                <div
                  key={ioc.id}
                  onClick={() => setActiveIoc(ioc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121e36] border-cyan-500 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/40'
                      : 'bg-[#0e1626] border-[#1e2d4d] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold uppercase">
                          {ioc.type}
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 font-bold">{ioc.tlp}</span>
                      </div>
                      <div className="font-mono text-xs font-bold text-white mt-1 break-all">
                        {ioc.value}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {ioc.confidenceScore}%
                      </span>
                      <div className="text-[9px] text-slate-400">Confidence</div>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-rose-300 font-medium">
                    {ioc.threatActor || 'APT29 (Cozy Bear)'} • {ioc.malwareFamily}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed OpenCTI Enrichment Details */}
        <div className="lg:col-span-7">
          {activeIoc ? (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-5 shadow-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-[#1b2742] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                      OpenCTI ID: {activeIoc.openCtiId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                      {activeIoc.tlp}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1.5 font-mono break-all">
                    {activeIoc.value}
                  </h2>
                </div>

                <button
                  onClick={() => onAskAI(`Explain threat actor ${activeIoc.threatActor} and recommend defense for ${activeIoc.value}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Defense</span>
                </button>
              </div>

              {/* Enrichment Workflow Visualizer (Matching Prompt Spec) */}
              <div className="bg-[#070b14] border border-cyan-500/40 rounded-xl p-3.5 font-mono text-xs text-slate-200">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">
                  Enrichment Pipeline Trace
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-center text-[11px]">
                  <div className="bg-[#0e172a] px-2.5 py-1.5 rounded-lg border border-[#1e2d4d]">
                    <div className="text-slate-400 text-[9px]">Ingest Alert</div>
                    <div className="text-cyan-300 font-bold">Wazuh / FortiGate</div>
                  </div>
                  <span className="text-cyan-400">→</span>
                  <div className="bg-[#0e172a] px-2.5 py-1.5 rounded-lg border border-[#1e2d4d]">
                    <div className="text-slate-400 text-[9px]">Extracted IOC</div>
                    <div className="text-white font-bold">{activeIoc.type}</div>
                  </div>
                  <span className="text-cyan-400">→</span>
                  <div className="bg-[#0e172a] px-2.5 py-1.5 rounded-lg border border-[#1e2d4d]">
                    <div className="text-slate-400 text-[9px]">CTI Connector</div>
                    <div className="text-purple-300 font-bold">OpenCTI GraphQL</div>
                  </div>
                  <span className="text-cyan-400">→</span>
                  <div className="bg-[#0e172a] px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/20">
                    <div className="text-rose-400 text-[9px]">Vichhai AI Score</div>
                    <div className="text-rose-300 font-bold">{activeIoc.confidenceScore}% (MALICIOUS)</div>
                  </div>
                </div>
              </div>

              {/* Threat Actor & Malware Attribution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Attributed Threat Actor</div>
                  <div className="text-sm font-bold text-rose-400">{activeIoc.threatActor || 'APT29 (Cozy Bear)'}</div>
                  <p className="text-[11px] text-slate-400">
                    Known Russian state-sponsored cyber espionage group targeting government and financial sectors.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e172a] border border-[#1e2d4d] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Malware Family & Toolset</div>
                  <div className="text-sm font-bold text-amber-300">{activeIoc.malwareFamily || 'Cobalt Strike Beacon'}</div>
                  <p className="text-[11px] text-slate-400">
                    Post-exploitation framework utilizing Malleable C2 profiles with in-memory reflective DLL injection.
                  </p>
                </div>
              </div>

              {/* Feed Sources */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Originating Threat Intel Feeds & Certifications
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeIoc.sources.map((src, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#0e172a] text-slate-300 border border-[#1e2d4d] text-xs font-mono flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{src}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Connected MITRE ATT&CK Info */}
              <div className="border-t border-[#1b2742] pt-3 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Associated MITRE ATT&CK Matrix Techniques
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#080d17] border border-[#172238] text-slate-300">
                    <strong className="text-amber-300 font-mono">T1071.001</strong> – Application Layer: Web Protocols
                  </div>
                  <div className="p-2 rounded-lg bg-[#080d17] border border-[#172238] text-slate-300">
                    <strong className="text-amber-300 font-mono">T1059.001</strong> – Command and Scripting: PowerShell
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b1220] border border-[#1b2742] rounded-2xl p-12 text-center text-slate-400">
              Select an indicator to view OpenCTI Threat Intelligence details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
