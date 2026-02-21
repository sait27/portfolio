import { useMemo, useState } from 'react';
import { FaAws, FaCode, FaDatabase, FaPython } from 'react-icons/fa';
import {
  SiCss3,
  SiDjango,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFlask,
  SiGit,
  SiGithub,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiKubernetes,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiRedux,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

const SKILL_ICON_RULES = [
  { test: /\breact\b/, icon: SiReact },
  { test: /\bnext(\.|\s|-)?js\b|\bnextjs\b/, icon: SiNextdotjs },
  { test: /\bnode(\.|\s|-)?js\b|\bnodejs\b/, icon: SiNodedotjs },
  { test: /\bexpress\b/, icon: SiExpress },
  { test: /\bdjango\b/, icon: SiDjango },
  { test: /\bflask\b/, icon: SiFlask },
  { test: /\bfastapi\b/, icon: SiFastapi },
  { test: /\btypescript\b|\bts\b/, icon: SiTypescript },
  { test: /\bjavascript\b|\bjs\b/, icon: SiJavascript },
  { test: /\bhtml(5)?\b/, icon: SiHtml5 },
  { test: /\bcss(3)?\b/, icon: SiCss3 },
  { test: /\btailwind\b/, icon: SiTailwindcss },
  { test: /\bredux\b/, icon: SiRedux },
  { test: /\bpython\b/, icon: FaPython },
  { test: /\bpostgres\b|\bpostgresql\b/, icon: SiPostgresql },
  { test: /\bmysql\b|\bsql\b/, icon: SiMysql },
  { test: /\bmongo\b|\bmongodb\b/, icon: SiMongodb },
  { test: /\bredis\b/, icon: SiRedis },
  { test: /\bgraphql\b/, icon: SiGraphql },
  { test: /\bdocker\b/, icon: SiDocker },
  { test: /\bkubernetes\b|\bk8s\b/, icon: SiKubernetes },
  { test: /\baws\b|\bamazon web services\b/, icon: FaAws },
  { test: /\bgithub\b/, icon: SiGithub },
  { test: /\bgit\b/, icon: SiGit },
  { test: /\blinux\b/, icon: SiLinux },
  { test: /\bdatabase\b|\bdb\b/, icon: FaDatabase },
];

const normalizeSkillName = (name) => String(name || '').trim().toLowerCase();

const getSkillIconByName = (name) => {
  const normalized = normalizeSkillName(name);
  if (!normalized) return FaCode;
  const rule = SKILL_ICON_RULES.find(({ test }) => test.test(normalized));
  return rule?.icon || FaCode;
};

export default function SkillIcon({ name, iconUrl, className = '', fallbackClassName = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = useMemo(() => getSkillIconByName(name), [name]);

  if (iconUrl && !imageFailed) {
    return (
      <img
        src={iconUrl}
        alt=""
        aria-hidden="true"
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <Icon className={`${className} ${fallbackClassName}`.trim()} aria-hidden="true" />;
}
